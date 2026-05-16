import { STUDIO_LK } from "@/lib/platform/constants";
import { END_YEAR_EVENT_ID } from "@/lib/shop-logic";
import type { ShopOrder, ShopProduct } from "@/lib/types";

export function seedShopProducts(): ShopProduct[] {
  return [
    {
      id: "shop_lk_tee",
      studioId: STUDIO_LK,
      title: "חולצת LK — כפר ויתקין",
      description: "בד נושם, לוגו רקום באדום-זהב, מתאים לשיעורים ולחימום בסטודיו.",
      category: "studio_wear",
      price: 89,
      currency: "ILS",
      tags: ["חולצה", "ממותג", "LK"],
      availableSizes: ["XS", "S", "M", "L", "XL"],
      availableColors: ["שחור", "לבן"],
      stockStatus: "in_stock",
      isActive: true
    },
    {
      id: "shop_lk_hoodie",
      studioId: STUDIO_LK,
      title: "הודי LK Oversized",
      description: "פליז רך עם הדפס עדין — מושלם לפני ואחרי שיעור, באווירת הסטודיו.",
      category: "studio_wear",
      price: 189,
      currency: "ILS",
      tags: ["הודי", "חורף", "LK", "חדש"],
      availableSizes: ["S", "M", "L", "XL"],
      availableColors: ["אפור כהה", "שחור"],
      stockStatus: "low_stock",
      isActive: true
    },
    {
      id: "shop_flamenco_skirt",
      studioId: STUDIO_LK,
      title: "חצאית פלמנקו — Junior",
      description: "חצאית אימון לפלמנקו, צבע עמוק — בהתאמה במשרד הסטודיו.",
      category: "studio_wear",
      price: 165,
      currency: "ILS",
      tags: ["פלמנקו", "ממותג"],
      availableSizes: ["ילדים S", "ילדים M", "נוער", "בוגרים"],
      availableColors: ["אדום", "שחור"],
      stockStatus: "in_stock",
      isActive: true
    },
    {
      id: "shop_jazz_shoe",
      studioId: STUDIO_LK,
      title: "נעל ג'אז — רמה מקצועית",
      description: "סוליה גמישה, התאמה בחנות הסטודיו בכפר ויתקין לאחר הזמנה.",
      category: "dance_shoes",
      price: 220,
      currency: "ILS",
      tags: ["ג'אז", "נעליים"],
      availableSizes: ["35", "36", "37", "38", "39", "40", "41"],
      stockStatus: "in_stock",
      isActive: true
    },
    {
      id: "shop_turn_sock",
      studioId: STUDIO_LK,
      title: "גרבי סיבוב (זוג)",
      description: "גריפ טוב לרצפה — מומלץ לנבחרות ולבלט.",
      category: "dance_socks",
      price: 45,
      currency: "ILS",
      tags: ["גרביים", "בלט"],
      availableSizes: ["S/M", "L/XL"],
      availableColors: ["שחור", "בז'"],
      stockStatus: "in_stock",
      isActive: true
    },
    {
      id: "shop_acro_grip",
      studioId: STUDIO_LK,
      title: "כפות אחיזה לאקרו — LK",
      description: "אחיזה בטוחה לתרגילי אוויר וליווי — מומלץ לנבחרת האקרו.",
      category: "accessories",
      price: 79,
      currency: "ILS",
      tags: ["אקרו", "acro", "נבחרת"],
      stockStatus: "in_stock",
      isActive: true
    },
    {
      id: "shop_stretch_band",
      studioId: STUDIO_LK,
      title: "גומיית התנגדות — LK",
      description: "3 רמות התנגדות, כולל מדריך תרגול ביתי מהצוות.",
      category: "accessories",
      price: 55,
      currency: "ILS",
      tags: ["גמישות", "תרגול ביתי"],
      stockStatus: "in_stock",
      isActive: true
    },
    {
      id: "shop_end_year_ticket",
      studioId: STUDIO_LK,
      title: "כרטיס מופע סוף שנה",
      description: "כניסה למופע סוף השנה. מושבים לפי סדר הגעה. יש להציג אישור תשלום בכניסה.",
      category: "event_ticket",
      price: 75,
      currency: "ILS",
      tags: ["מופע סוף שנה", "מופע", "כרטיס"],
      stockStatus: "in_stock",
      relatedEventId: END_YEAR_EVENT_ID,
      isActive: true
    },
    {
      id: "shop_end_year_vip",
      studioId: STUDIO_LK,
      title: "חבילת VIP — מופע סוף שנה",
      description: "2 כרטיסים + מקום שמור בשורה הראשונה + חולצת LK מתנה.",
      category: "event_ticket",
      price: 220,
      currency: "ILS",
      tags: ["מופע סוף שנה", "VIP"],
      stockStatus: "low_stock",
      relatedEventId: END_YEAR_EVENT_ID,
      isActive: true
    },
    {
      id: "shop_summer_camp",
      studioId: STUDIO_LK,
      title: "מקדמה — קייטנת ריקוד קיץ LK",
      description: "תשלום ראשון לשבוע האינטנסיבי בכפר ויתקין. יתרת התשלום במשרדי הסטודיו.",
      category: "workshop",
      price: 450,
      currency: "ILS",
      tags: ["קייטנה", "קיץ"],
      stockStatus: "preorder",
      relatedEventId: "evt_future_camp",
      isActive: true
    }
  ];
}

export function seedShopOrders(): ShopOrder[] {
  return [
    {
      id: "ord_1001",
      studioId: STUDIO_LK,
      userId: "u_maya",
      userName: "מאיה כהן",
      items: [{ productId: "shop_end_year_ticket", quantity: 2 }],
      totalPrice: 150,
      currency: "ILS",
      paymentStatus: "paid",
      fulfillmentStatus: "ready_for_pickup",
      paymentMethod: "bit",
      createdAt: "2026-05-10T14:22:00.000Z"
    },
    {
      id: "ord_1002",
      studioId: STUDIO_LK,
      userId: "u_yuval",
      userName: "יובל אברהם",
      items: [{ productId: "shop_lk_tee", quantity: 1, size: "M", color: "שחור" }],
      totalPrice: 89,
      currency: "ILS",
      paymentStatus: "pending",
      fulfillmentStatus: "new",
      paymentMethod: "credit_card",
      createdAt: "2026-05-14T09:05:00.000Z"
    }
  ];
}
