export const sliderItems = [
  {
    id: 1,
    image: "https://images.pexels.com/photos/14555652/pexels-photo-14555652.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260",
    title: "OFERTAS DENIMS",
    desc: "Por lanzamiento 15% de descuento en toda la tienda.",
    bg: "f5fafd",
    categoryId: "6a8c7515ed5e69696954ae0c"
  },
  {
    id: 2,
    image: "https://images.pexels.com/photos/8851053/pexels-photo-8851053.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    title: "CAMISETAS Y SACOS",
    desc: "Por lanzamiento 15% de descuento en toda la tienda.",
    bg: "fcf1ed",
    categoryId: "6a8c9e1859888543ab70f861"
  },
  {
    id: 3,
    image: "https://res.cloudinary.com/tyskxzn2/image/upload/v1787956845/descarga_5.jpg",
    title: "CALZADO",
    desc: "Por lanzamiento 15% de descuento en toda la tienda.",
    bg: "fbf0f4",
    categoryId: "6a8c9dd159888543ab70f860"
  }

]

export const categories = [
  {
    id: 1,
    image: "https://res.cloudinary.com/tyskxzn2/image/upload/v1787600938/products/iionxboauslzlalpudee.jpg",
    title: "Calzado",
    category: "6a8c9dd159888543ab70f860"
  },
  {
    id: 2,
    image: "https://res.cloudinary.com/tyskxzn2/image/upload/v1787601089/products/ixxof0lukdqzol80xzwi.jpg",
    title: "DENIMS",
    category: "6a8c7515ed5e69696954ae0c"
  },
  {
    id: 3,
    image: "https://res.cloudinary.com/tyskxzn2/image/upload/v1787593207/products/vcpppcsbvuc3er6jc0qc.jpg",
    title: "Camisetas y Sacos",
    category: "6a8c9e1859888543ab70f861"
  },
];

export const popularProducts = [
  {
    id:1,
    image:"https://d3o2e4jr3mxnm3.cloudfront.net/Mens-Jake-Guitar-Vintage-Crusher-Tee_68382_1_lg.png",
    name: "Jake Guitar Vintage Crusher Tee",
    price: 20,
  },
  {
    id:2,
    image:"https://cdn.shopify.com/s/files/1/0101/4832/products/Angela_Natural_Tee.png?v=1606780388",
    name: "Angela Natural Tee",
    price: 25,
  },
  {
    id:3,
    image:"https://www.prada.com/content/dam/pradanux_products/U/UCS/UCS319/1YOTF010O/UCS319_1YOT_F010O_S_182_SLF.png",
    name: "Double Match Heavy Cotton Shirt",
    price: 30,
  },
  {
    id:4,
    image:"https://www.burdastyle.com/pub/media/catalog/product/cache/7bd3727382ce0a860b68816435d76e26/107/BUS-PAT-BURTE-1320516/1170x1470_BS_2016_05_132_front.png",
    name: "Cotton Dress",
    price: 30,
  },
  {
    id:5,
    image:"https://images.ctfassets.net/5gvckmvm9289/3BlDoZxSSjqAvv1jBJP7TH/65f9a95484117730ace42abf64e89572/Noissue-x-Creatsy-Tote-Bag-Mockup-Bundle-_4_-2.png",
    name: "Noissue X Creatsy Tote Bag",
    price: 10,
  },
  {
    id:6,
    image:"https://d3o2e4jr3mxnm3.cloudfront.net/Rocket-Vintage-Chill-Cap_66374_1_lg.png",
    name: "Rocket Vintage Chill Cap",
    price: 8,
  },
  {
    id:7,
    image:"https://www.prada.com/content/dam/pradanux_products/2/2TE/2TE183/3LJ6F0964/2TE183_3LJ6_F0964_SLR.png/_jcr_content/renditions/cq5dam.web.hf7f7f7.400.500.webp",
    name: "White Leather high-top Sneakers",
    price: 50,
  },
  {
    id:8,
    image:"https://www.pngarts.com/files/3/Women-Jacket-PNG-High-Quality-Image.png",
    name: "Women Jacket",
    price: 65,
  },
]

export const dummyOrderStatus = ['pending', 'shipped', 'in transit', 'delivered']

export const dummyOrders = [0,3,6].map(num => ({
  products: [...popularProducts].splice(num, 3).map(p => ({
    product: p,
    quantity: Math.floor(Math.random() * 3 + 1),
  }))
})).map((order, i) => ({
  ...order,
  id: i,
  amount: order.products.reduce((sum, p) => sum + (p.product.price * p.quantity), 0),
  address: "221b Baker St, London NW1 6XE, UK",
  status: dummyOrderStatus[Math.floor(Math.random() * dummyOrderStatus.length)],
}))