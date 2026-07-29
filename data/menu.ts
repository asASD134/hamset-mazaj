export const menuCategories = [
  {
    id: "hot-coffee",
    title: "☕ القهوة الساخنة",
    items: [
      {
        id: "arabic-coffee",
        icon: "☕",
        image: "/images/menu/arabic-coffee.jpg",
        featured: true,
        name: "قهوة عربية",
        description: "قهوة عربية فاخرة تقدم مع التمر.",
        price: 15,
      },
      {
        id: "espresso",
        icon: "☕",
        image: "/images/menu/espresso.jpg",
        featured: false,
        name: "إسبريسو",
        description: "إسبريسو غني بطعم قوي ومميز.",
        price: 12,
      },
      {
        id: "latte",
        icon: "🥛",
        image: "/images/menu/latte.jpg",
        featured: true,
        name: "لاتيه",
        description: "إسبريسو مع حليب مبخر ورغوة ناعمة.",
        price: 18,
      },
      {
        id: "mocha",
        icon: "🍫",
        image: "/images/menu/mocha.jpg",
        featured: false,
        name: "موكا",
        description: "قهوة بالشوكولاتة مع الحليب.",
        price: 20,
      },
    ],
  },

  {
    id: "cold-drinks",
    title: "🧊 المشروبات الباردة",
    items: [
      {
        id: "iced-latte",
        icon: "🧊",
        image: "/images/menu/iced-latte.jpg",
        featured: true,
        name: "آيس لاتيه",
        description: "لاتيه بارد ومنعش.",
        price: 20,
      },
      {
        id: "frappuccino",
        icon: "🥤",
        image: "/images/menu/frappuccino.jpg",
        featured: false,
        name: "فرابتشينو",
        description: "مشروب بارد ممزوج بالكريمة.",
        price: 24,
      },
    ],
  },

  {
    id: "desserts",
    title: "🍰 الحلويات",
    items: [
      {
        id: "cheesecake",
        icon: "🍰",
        image: "/images/menu/cheesecake.jpg",
        featured: true,
        name: "تشيز كيك",
        description: "تشيز كيك طازج ولذيذ.",
        price: 18,
      },
      {
        id: "cookies",
        icon: "🧁",
        image: "/images/menu/cookies.jpg",
        featured: false,
        name: "كوكيز",
        description: "كوكيز بالشوكولاتة.",
        price: 10,
      },
    ],
  },
];