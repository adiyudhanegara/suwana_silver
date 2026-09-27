/*
 * Suwana Silver: site content and settings.
 *
 * WHATSAPP_NUMBER is a placeholder. Replace it with the real number
 * (country code, digits only, no "+" or spaces) and every WhatsApp
 * link on the site updates.
 *
 * Everything under `sample` is placeholder content. It is rendered with
 * data-sample="true" so it is easy to find, and must be replaced before launch.
 */
window.SUWANA = {
  WHATSAPP_NUMBER: "62987654321",
  WHATSAPP_DISPLAY: "+62 987 654 321",

  // Used only for the "about US$" hint next to IDR prices.
  IDR_PER_USD: 16300,

  business: {
    name: "Suwana Silver",
    founder: "I Made Suwana",
    founded: 1997,
    address: "Jl. Jagaraga Celuk, Sukawati, Gianyar, Bali, Indonesia",
    hours: "Daily, 08:00–18:00",
    instagram: "suwanasilver",
    email: "made.suwana05@gmail.com",
    mapQuery: "Jl. Jagaraga Celuk, Sukawati, Gianyar, Bali"
  },

  sample: {
    rating: { score: 4.9, count: 214, source: "Google" },

    reviews: [
      { name: "Sarah", stars: 5, text: "We did the couple class and made each other's rings. Made's son was patient with us the whole time, even when I melted my first wire." },
      { name: "Kenji", stars: 5, text: "Bought a filigree pendant for my mother. You can see the workshop behind the shop, and they showed me how the grains are set." },
      { name: "Ana", stars: 5, text: "Our kids (8 and 11) loved the family class. Three hours went fast, and they still wear their rings." }
    ],

    classIncludes: "925 silver, tools, guidance, tea and snacks, and polishing, so you take your piece home the same day.",

    classes: [
      { id: "single", name: "Single class", people: "1 person", maxPeople: 1, hours: "3 hours", makes: "Make one ring or pendant", priceIDR: 450000 },
      { id: "couple", name: "Couple class", people: "2 people", maxPeople: 2, hours: "3 hours", makes: "Make a pair of rings", priceIDR: 850000 },
      { id: "family", name: "Family class", people: "Up to 4 people, children from 7 years", maxPeople: 4, hours: "3.5 hours", makes: "One piece each", priceIDR: 1500000 }
    ],

    products: [
      { id: "filigree-flower-ring", type: "rings", name: "Filigree flower ring", priceIDR: 650000, technique: "Twisted-wire filigree petals around a single silver grain.", photo: "Filigree flower ring on dark wood, top view", featured: true },
      { id: "granulation-dome-ring", type: "rings", name: "Granulation dome ring", priceIDR: 780000, technique: "A domed top covered in silver grains, set one by one.", photo: "Granulation dome ring, side view showing the grains" },
      { id: "hammered-band", type: "rings", name: "Plain hammered band", priceIDR: 420000, technique: "A plain band, textured by hand with a small hammer.", photo: "Hammered band on the workbench" },
      { id: "frangipani-studs", type: "earrings", name: "Frangipani filigree studs", priceIDR: 520000, technique: "Five-petal frangipani flowers in open filigree.", photo: "Frangipani studs, pair, front view", featured: true },
      { id: "granulation-drops", type: "earrings", name: "Granulation drop earrings", priceIDR: 890000, technique: "Teardrops edged with rows of tiny silver grains.", photo: "Granulation drop earrings hanging from a wire", featured: true },
      { id: "barong-pendant", type: "pendants", name: "Barong face pendant", priceIDR: 1150000, technique: "The Barong's face, built up in filigree and granulation.", photo: "Barong face pendant, close-up of the face", featured: true },
      { id: "lotus-pendant", type: "pendants", name: "Lotus filigree pendant", priceIDR: 720000, technique: "An open lotus in filigree, darkened to show the wire pattern.", photo: "Lotus pendant on its chain", featured: true },
      { id: "twisted-cuff", type: "bracelets", name: "Twisted wire cuff", priceIDR: 1350000, technique: "Three twisted wires soldered into an open cuff.", photo: "Twisted wire cuff on a wrist", featured: true },
      { id: "woven-chain", type: "bracelets", name: "Woven chain bracelet", priceIDR: 980000, technique: "A chain woven by hand from fine silver wire.", photo: "Woven chain bracelet laid flat" }
    ]
  }
};
