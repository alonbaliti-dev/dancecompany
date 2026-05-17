"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePlatform } from "@/context/PlatformContext";
import {
  canManageShopCatalog,
  canManageShopOrder,
  canPurchaseShopProduct,
  canViewPlatformShopAnalytics,
  canViewShopOrder,
  canViewShopProduct
} from "@/lib/security/permissions";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import { useDomainMutation } from "@/lib/hooks/useDomainMutation";
import * as commerceOps from "@/lib/domains/commerce/operations";
import { downloadJsonFile } from "@/lib/local-db/export-db";
import { cartTotal } from "@/lib/shop-logic";
import { createPaymentIntent, recordPaymentAudit, shopPaymentStatusFromTransaction, verifyPayment } from "@/lib/payments/payment-service";
import { shopMethodToProvider } from "@/lib/payments/shop-bridge";
import type {
  ShopCartLine,
  ShopFulfillmentStatus,
  ShopOrder,
  ShopPaymentMethod,
  ShopPaymentStatus,
  ShopProduct,
  ShopProductFormPayload,
  UserProfile
} from "@/lib/types";

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

type Ctx = {
  user: UserProfile;
  products: ShopProduct[];
  visibleProducts: ShopProduct[];
  orders: ShopOrder[];
  myOrders: ShopOrder[];
  studioOrders: ShopOrder[];
  cart: ShopCartLine[];
  cartCount: number;
  cartTotalNis: number;
  canManageShop: boolean;
  canViewPlatformAnalytics: boolean;
  focusEventId: string | null;
  setFocusEventId: (id: string | null) => void;
  getProduct: (id: string) => ShopProduct | undefined;
  ordersForEvent: (eventId: string) => ShopOrder[];
  myOrderForEvent: (eventId: string) => ShopOrder | undefined;
  addToCart: (productId: string, opts?: { quantity?: number; size?: string; color?: string }) => boolean;
  updateCartLine: (productId: string, patch: Partial<Pick<ShopCartLine, "quantity" | "size" | "color">>) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkout: (paymentMethod: ShopPaymentMethod) => ShopOrder | null;
  checkoutWithPayment: (paymentMethod: ShopPaymentMethod) => Promise<ShopOrder | null>;
  confirmPendingPayment: (orderId: string) => Promise<ShopOrder | null>;
  createProduct: (payload: ShopProductFormPayload) => string;
  updateProduct: (id: string, patch: Partial<ShopProductFormPayload> & { isActive?: boolean }) => void;
  setProductActive: (id: string, isActive: boolean) => void;
  updateOrderPayment: (orderId: string, status: ShopPaymentStatus) => void;
  updateOrderFulfillment: (orderId: string, status: ShopFulfillmentStatus) => void;
  sendPaymentReminder: (orderId: string) => boolean;
  exportStudioOrders: () => boolean;
};

const ShopContext = createContext<Ctx | null>(null);

export function ShopProvider({
  user,
  children,
  initialEventId = null
}: {
  user: UserProfile;
  children: ReactNode;
  initialEventId?: string | null;
}) {
  const { appendAudit } = usePlatform();
  const studioId = user.studioId;
  const { db, setDb } = useLocalDatabase();
  const mutate = useDomainMutation();
  const products = db.shopProducts;
  const orders = db.shopOrders;

  const setProducts = useCallback(
    (updater: ShopProduct[] | ((prev: ShopProduct[]) => ShopProduct[])) => {
      setDb((prev) => ({
        ...prev,
        shopProducts: typeof updater === "function" ? updater(prev.shopProducts) : updater
      }));
    },
    [setDb]
  );

  const setOrders = useCallback(
    (updater: ShopOrder[] | ((prev: ShopOrder[]) => ShopOrder[])) => {
      setDb((prev) => ({
        ...prev,
        shopOrders: typeof updater === "function" ? updater(prev.shopOrders) : updater
      }));
    },
    [setDb]
  );
  const [cart, setCart] = useState<ShopCartLine[]>([]);
  const [focusEventId, setFocusEventId] = useState<string | null>(initialEventId);

  useEffect(() => {
    if (initialEventId) setFocusEventId(initialEventId);
  }, [initialEventId]);

  const canManageShop = canManageShopCatalog(user, studioId);
  const canViewPlatformAnalytics = canViewPlatformShopAnalytics(user);

  const visibleProducts = useMemo(
    () => products.filter((p) => p.studioId === studioId && canViewShopProduct(user, p)),
    [products, studioId, user]
  );

  const studioOrders = useMemo(
    () => orders.filter((o) => o.studioId === studioId && canViewShopOrder(user, o)),
    [orders, studioId, user]
  );

  const myOrders = useMemo(
    () => studioOrders.filter((o) => o.userId === user.id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [studioOrders, user.id]
  );

  const cartCount = useMemo(() => cart.reduce((n, l) => n + l.quantity, 0), [cart]);
  const cartTotalNis = useMemo(() => cartTotal(cart), [cart]);

  const getProduct = useCallback((id: string) => visibleProducts.find((p) => p.id === id), [visibleProducts]);

  const ordersForEvent = useCallback(
    (eventId: string) => {
      const ids = products.filter((p) => p.relatedEventId === eventId).map((p) => p.id);
      return studioOrders.filter((o) => o.items.some((i) => ids.includes(i.productId)));
    },
    [products, studioOrders]
  );

  const myOrderForEvent = useCallback(
    (eventId: string) => myOrders.find((o) => o.items.some((i) => products.find((p) => p.id === i.productId)?.relatedEventId === eventId)),
    [myOrders, products]
  );

  const addToCart = useCallback(
    (productId: string, opts?: { quantity?: number; size?: string; color?: string }) => {
      const product = products.find((p) => p.id === productId);
      if (!product || !canPurchaseShopProduct(user, product)) return false;
      const qty = Math.max(1, opts?.quantity ?? 1);
      setCart((prev) => {
        const existing = prev.find((l) => l.productId === productId);
        if (existing) {
          return prev.map((l) =>
            l.productId === productId ? { ...l, quantity: l.quantity + qty, size: opts?.size ?? l.size, color: opts?.color ?? l.color } : l
          );
        }
        return [...prev, { productId, product, quantity: qty, size: opts?.size, color: opts?.color }];
      });
      return true;
    },
    [products, user]
  );

  const updateCartLine = useCallback((productId: string, patch: Partial<Pick<ShopCartLine, "quantity" | "size" | "color">>) => {
    setCart((prev) =>
      prev
        .map((l) => (l.productId === productId ? { ...l, ...patch, quantity: Math.max(1, patch.quantity ?? l.quantity) } : l))
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const createPendingOrder = useCallback(
    (
      paymentMethod: ShopPaymentMethod,
      paymentStatus: ShopPaymentStatus,
      paymentTransactionId?: string,
      presetOrderId?: string
    ) => {
      const total = cartTotal(cart);
      const order: ShopOrder = {
        id: presetOrderId ?? newId("ord"),
        studioId,
        userId: user.id,
        userName: user.name,
        items: cart.map(({ productId, quantity, size, color }) => ({ productId, quantity, size, color })),
        totalPrice: total,
        currency: "ILS",
        paymentStatus,
        fulfillmentStatus: "new",
        paymentMethod,
        paymentTransactionId,
        createdAt: new Date().toISOString()
      };
      mutate(commerceOps.buildAppendShopOrderMutation(user, order));
      setCart([]);
      return order;
    },
    [cart, studioId, user, mutate]
  );

  const checkout = useCallback(
    (paymentMethod: ShopPaymentMethod): ShopOrder | null => {
      if (!cart.length) return null;
      for (const line of cart) {
        if (!canPurchaseShopProduct(user, line.product)) return null;
      }
      const status: ShopPaymentStatus =
        paymentMethod === "bank_transfer" || paymentMethod === "paybox" ? "pending" : "paid";
      return createPendingOrder(paymentMethod, status);
    },
    [cart, user, createPendingOrder]
  );

  const checkoutWithPayment = useCallback(
    async (paymentMethod: ShopPaymentMethod): Promise<ShopOrder | null> => {
      if (!cart.length) return null;
      for (const line of cart) {
        if (!canPurchaseShopProduct(user, line.product)) return null;
      }

      const normalizedMethod = paymentMethod === "card" ? "credit_card" : paymentMethod;
      const total = cartTotal(cart);

      if (normalizedMethod === "bank_transfer") {
        return createPendingOrder("bank_transfer", "pending");
      }

      const provider = shopMethodToProvider(normalizedMethod);
      if (!provider) return null;

      const orderId = newId("ord");
      const description = `LK Shop · ${cart.length} פריטים`;
      const checkoutType = cart.every((line) => line.product.category === "event_ticket")
        ? "event_ticket"
        : cart.every((line) => line.product.category === "workshop")
          ? "workshop_camp"
          : "shop";

      const intent = await createPaymentIntent({
        studioId,
        orderId,
        userId: user.id,
        provider,
        amount: total,
        currency: "ILS",
        description,
        returnUrl: typeof window !== "undefined" ? `${window.location.origin}/?shop=orders` : "/",
        checkoutDraft: {
          type: checkoutType,
          items: cart.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            size: line.size,
            color: line.color
          }))
        },
        walletSession:
          provider === "apple_pay"
            ? { platform: "apple_pay" }
            : provider === "google_pay"
              ? { platform: "google_pay" }
              : undefined
      });

      const paymentStatus = shopPaymentStatusFromTransaction(intent.transaction.status);
      const order = createPendingOrder(normalizedMethod, paymentStatus, intent.transaction.id, orderId);

      recordPaymentAudit({
        studioId,
        orderId,
        transactionId: intent.transaction.id,
        action: "payment_initiated",
        actorUserId: user.id,
        actorName: user.name,
        note: provider
      });

      if (intent.redirectUrl && typeof window !== "undefined" && (provider === "bit" || provider === "paybox")) {
        try {
          window.open(intent.redirectUrl, "_blank", "noopener,noreferrer");
        } catch {
          /* user can confirm manually */
        }
      }

      appendAudit({
        studioId,
        actorUserId: user.id,
        actorName: user.name,
        action: `סטטוס תשלום: ${order.paymentStatus}`,
        targetType: "shop_order",
        targetId: order.id,
        severity: "info"
      });

      return order;
    },
    [cart, studioId, user, createPendingOrder, appendAudit]
  );

  const confirmPendingPayment = useCallback(
    async (orderId: string): Promise<ShopOrder | null> => {
      const order = orders.find((o) => o.id === orderId);
      if (!order?.paymentTransactionId) return null;

      const tx = await verifyPayment({ transactionId: order.paymentTransactionId, studioId: order.studioId });
      if (!tx) return null;

      const paymentStatus = shopPaymentStatusFromTransaction(tx.status);
      let nextOrder: ShopOrder | null = null;
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          nextOrder = {
            ...o,
            paymentStatus,
            receiptUrl: paymentStatus === "paid" ? `/api/receipts/${orderId}.pdf` : o.receiptUrl
          };
          return nextOrder;
        })
      );

      recordPaymentAudit({
        studioId: order.studioId,
        orderId,
        transactionId: tx.id,
        action: paymentStatus === "paid" ? "payment_paid" : "payment_authorized",
        actorUserId: user.id,
        actorName: user.name
      });

      appendAudit({
        studioId: order.studioId,
        actorUserId: user.id,
        actorName: user.name,
        action: `סטטוס תשלום: ${paymentStatus}`,
        targetType: "shop_order",
        targetId: orderId,
        severity: "info"
      });

      return nextOrder;
    },
    [orders, user, appendAudit]
  );

  const createProduct = useCallback(
    (payload: ShopProductFormPayload) => {
      if (!canManageShop) return "";
      const result = mutate(commerceOps.buildCreateProductMutation(user, payload));
      if (!result.ok) return "";
      return result.database.shopProducts[0]?.id ?? "";
    },
    [canManageShop, user, mutate]
  );

  const updateProduct = useCallback(
    (id: string, patch: Partial<ShopProductFormPayload> & { isActive?: boolean }) => {
      const existing = products.find((p) => p.id === id);
      if (!existing) return;
      const input = commerceOps.buildUpdateProductMutation(user, id, patch, existing);
      if (input) mutate({ ...input, actor: user });
    },
    [products, user, mutate]
  );

  const setProductActive = useCallback(
    (id: string, isActive: boolean) => {
      updateProduct(id, { isActive });
    },
    [updateProduct]
  );

  const updateOrderPayment = useCallback(
    (orderId: string, status: ShopPaymentStatus) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;
      const input = commerceOps.buildUpdateOrderPaymentMutation(user, order, status);
      if (!input) return;
      mutate({ ...input, actor: user });
      if (order.paymentTransactionId) {
        recordPaymentAudit({
          studioId: order.studioId,
          orderId,
          transactionId: order.paymentTransactionId,
          action: "payment_manual_status_changed",
          actorUserId: user.id,
          actorName: user.name,
          note: status
        });
      }
    },
    [orders, user, mutate]
  );

  const updateOrderFulfillment = useCallback(
    (orderId: string, status: ShopFulfillmentStatus) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;
      const input = commerceOps.buildUpdateOrderFulfillmentMutation(user, order, status);
      if (input) mutate({ ...input, actor: user });
    },
    [orders, user, mutate]
  );

  const sendPaymentReminder = useCallback(
    (orderId: string) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order || !canManageShopOrder(user, order) || order.paymentStatus === "paid") return false;
      if (order.paymentTransactionId) {
        recordPaymentAudit({
          studioId: order.studioId,
          orderId,
          transactionId: order.paymentTransactionId,
          action: "payment_reminder_sent",
          actorUserId: user.id,
          actorName: user.name
        });
      }
      appendAudit({
        studioId: order.studioId,
        actorUserId: user.id,
        actorName: user.name,
        action: "תזכורת תשלום נשלחה",
        targetType: "shop_order",
        targetId: orderId,
        severity: "info"
      });
      return true;
    },
    [orders, user, appendAudit]
  );

  const exportStudioOrders = useCallback(() => {
    if (!canManageShop) return false;
    const stamp = new Date().toISOString().slice(0, 10);
    downloadJsonFile(`lk-shop-orders-${studioId}-${stamp}.json`, studioOrders);
    appendAudit({
      studioId,
      actorUserId: user.id,
      actorName: user.name,
      action: "ייצוא הזמנות חנות",
      targetType: "shop_order",
      severity: "info"
    });
    return true;
  }, [canManageShop, studioId, user, appendAudit, studioOrders]);

  const value = useMemo(
    () => ({
      user,
      products,
      visibleProducts,
      orders,
      myOrders,
      studioOrders,
      cart,
      cartCount,
      cartTotalNis,
      canManageShop,
      canViewPlatformAnalytics,
      focusEventId,
      setFocusEventId,
      getProduct,
      ordersForEvent,
      myOrderForEvent,
      addToCart,
      updateCartLine,
      removeFromCart,
      clearCart,
      checkout,
      checkoutWithPayment,
      confirmPendingPayment,
      createProduct,
      updateProduct,
      setProductActive,
      updateOrderPayment,
      updateOrderFulfillment,
      sendPaymentReminder,
      exportStudioOrders
    }),
    [
      user,
      products,
      visibleProducts,
      orders,
      myOrders,
      studioOrders,
      cart,
      cartCount,
      cartTotalNis,
      canManageShop,
      canViewPlatformAnalytics,
      focusEventId,
      getProduct,
      ordersForEvent,
      myOrderForEvent,
      addToCart,
      updateCartLine,
      removeFromCart,
      clearCart,
      checkout,
      checkoutWithPayment,
      confirmPendingPayment,
      createProduct,
      updateProduct,
      setProductActive,
      updateOrderPayment,
      updateOrderFulfillment,
      sendPaymentReminder,
      exportStudioOrders
    ]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop requires ShopProvider");
  return ctx;
}
