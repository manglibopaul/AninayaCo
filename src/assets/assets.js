import p_img1 from './p_img1.png'
import p_img2 from './p_img2.png'
import p_img3 from './p_img3.png'
import p_img4 from './p_img4.png'
import p_img5 from './p_img5.png'
import p_img6 from './p_img6.png'
import p_img7 from './p_img7.png'
import p_img7_2 from './p_img7_2.png'
import p_img7_3 from './p_img7_3.png'
import p_img7_4 from './p_img7_4.png'
import p_img7_5 from './p_img7_5.png'
import p_img8 from './p_img8.png'
import p_img8_2 from './p_img8_2.png'
import p_img9 from './p_img9.png'
import p_img10 from './p_img10.png'
import p_img11 from './p_img11.png'
import p_img12 from './p_img12.png'
import p_img13_3 from './p_img13_3.png'
import p_img13_2 from './p_img13_2.png'
import p_img13 from './p_img13.png'
import p_img14 from './p_img14.png'
import p_img15 from './p_img15.png'
import p_img16 from './p_img16.png'
import p_img17 from './p_img17.png'
import p_img18 from './p_img18.png'
import p_img19 from './p_img19.png'
import p_img20 from './p_img20.png'
import p_img21 from './p_img21.png'
import p_img22 from './p_img22.png'
import p_img23 from './p_img23.png'
import p_img24 from './p_img24.png'
import p_img25 from './p_img25.png'
import p_img26 from './p_img26.png'
import p_img27 from './p_img27.png'
import p_img28 from './p_img28.png'
import p_img29 from './p_img29.png'
import p_img30 from './p_img30.png'
import p_img31 from './p_img31.png'
import p_img32 from './p_img32.png'
import p_img33 from './p_img33.png'
import p_img34 from './p_img34.png'
import p_img35 from './p_img35.png'
import p_img36 from './p_img36.png'
import p_img37 from './p_img37.png'
import p_img38 from './p_img38.png'
import p_img39 from './p_img39.png'
import p_img40 from './p_img40.png'
import p_img41 from './p_img41.png'
import p_img42 from './p_img42.png'
import p_img43 from './p_img43.png'
import p_img44 from './p_img44.png'
import p_img45 from './p_img45.png'
import p_img46 from './p_img46.png'
import p_img47 from './p_img47.png'
import p_img48 from './p_img48.png'
import p_img49 from './p_img49.png'
import p_img50 from './p_img50.png'
import p_img51 from './p_img51.png'
import p_img52 from './p_img52.png'
import p_img53 from './p_img53.png'


import logo from './logo.png'
import add_icon from './add_icon.png'
import order_icon from './order_icon.png'
import upload_area from './upload_area.png'
import parcel_icon from './parcel_icon.svg'
import bin_icon from './bin_icon.png'
import dropdown_icon from './dropdown_icon.png'
import cart_icon from './cart_icon.png'
import cross_icon from './cross_icon.png'
import exchange_icon from './exchange_icon.png'
import hero_img from './hero_img.png'
import menu_icon from './menu_icon.png'
import paypal_logo from './paypal_logo.png'
import profile_icon from './profile_icon.png'
import quality_icon from './quality_icon.png'
import razorpay_logo from './razorpay_logo.png'
import search_icon from './search_icon.png'
import star_dull_icon from './star_dull_icon.png'
import star_icon from './star_icon.png'
import stripe_logo from './stripe_logo.png'
import support_img from './support_img.png'
import visa_logo from './visa_logo.png'
import qr_code from './qr_code.png'
import gcash_logo from './gcash_logo.png'
import catpaw_model from './catpaw.glb'
import tulip_model from './tulip.glb'
import sunflower_model from './sunflower.glb'

export const assets = {
    logo,
    gcash_logo,
    qr_code,
    add_icon,
    order_icon,
    upload_area,
    parcel_icon,
    bin_icon,
    dropdown_icon,
    cart_icon,
    cross_icon,
    exchange_icon,
    hero_img,
    menu_icon,
    paypal_logo,
    profile_icon,
    quality_icon,
    razorpay_logo,
    search_icon,
    star_dull_icon,
    star_icon,
    stripe_logo,
    support_img,
    visa_logo,
}
export const products = [
    {
        _id: "aaaag",
         name: "Mini Octopus Keychain",
        description: "8 legs, endless cuteness your favorite color or fruit",
        price: 100,
        image: [p_img7, p_img7_2, p_img7_3, p_img7_4, p_img7_5],
        category: "Accessories",
        subCategory: "Keychains",
        date: 1716614345448,
        bestseller: false,

    },
    {
        _id: "aaaah",
         name: "Paw Keychain",
        description: "An adorable hand-crocheted paw keychain, perfect for animal lovers. Lightweight, charming, and adds a playful touch to your keys or bag!",
        price: 100,
        image: [p_img8, p_img8_2],
        modelUrl: catpaw_model,
        iosModel: "/models/catpaw.usdz",
        category: "Accessories",
        subCategory: "Keychains",
        date: 1716615345448,
        bestseller: false,

    },
    {
        _id: "aaaak",
         name: "Bini Keychain",
        description: "Crochet BINI inspired phone charm 101% handmade which make them extra special. Please, do keep in mind that minimal flaws can be seen.",
        price: 150,
        image: [p_img11],
        category: "Accessories",
        subCategory: "Keychains",
        date: 1716618345448,
        bestseller: "false",

    },
    {
        _id: "aaaal",
         name: "Frog Coaster",
        description: "A playful hand-crocheted frog coaster that protects your surfaces with a touch of fun. Cute, colorful, and perfect for everyday use!",
        price: 200,
        image: [p_img12],
        category: "Decor",
        subCategory: "Coasters",
        date: 1716619345448,
        bestseller: "false",

    },
    {
        _id: "aaaan",
         name: "Tulip",
        description: "A hand-crocheted bouquet of flowers that never fades. Perfect for brightening up any space or gifting a lasting, heartfelt keepsake",
        price: 200,
        image: [p_img14],
        modelUrl: tulip_model,
        iosModel: "/models/tulip.usdz",
        category: "Decor",
        subCategory: "Bouquets",
        date: 1716622345448,
        bestseller: "true",

    },
    {
        _id: "aaaao",
         name: "Sunflower",
        description: "A timeless hand-crocheted bouquet that stays beautiful forever. Perfect for home decor or as a heartfelt gift that never wilts.",
        price: 200,
        image: [p_img15],
        modelUrl: sunflower_model,
        iosModel: "/models/sunflower.usdz",
        category: "Decor",
        subCategory: "Bouquets",
        date: 1716621345448,
        bestseller: "true",

    },
    {
        _id: "aaaap",
         name: "Rose",
        description: "Delicately crocheted blooms wrapped with love — a bouquet that symbolizes warmth, care, and lasting beauty.",
        price: 200,
        image: [p_img16],
        category: "Decor",
        subCategory: "Bouquets",
        date: 1716623345448,
        bestseller: "true",

    },
    {
        _id: "aaaaq",
         name: "Flower Bouquets",
        description: "Add a pop of color to any space with this vibrant crochet bouquet! Handmade with care to bring joy that lasts all year round.",
        price: 200,
        image: [p_img17],
        category: "Decor",
        subCategory: "Bouquets",
        date: 1716624345448,
        bestseller: "true",

    },

]

