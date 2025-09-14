import { useState, useEffect } from "react"
import { Container } from "../../components/container"
import { Link } from "react-router-dom"

import {
  collection,
  query,
  getDocs,
  orderBy,
  where
} from 'firebase/firestore'
import { db } from "../../services/firebaseConnection"


interface ClothingProps {
  id: string;
  name: string;
  uid: string,
  price: string | number;
  city: string,
  images: ClothingImageProps[];
}

interface ClothingImageProps {
  name: string;
  uid: string;
  url: string;
}

export function Home() {
  const [clothing, setClothing] = useState<ClothingProps[]>([])
  const [loadImages, setLoadgImages] = useState<string[]>([])
  const [input, setInput] = useState("")

  useEffect(() => {
    loadCars();
  }, [])

  function loadCars() {
    const clothingRef = collection(db, "clothing")
    const queryRef = query(clothingRef, orderBy("created", "desc"))


    getDocs(queryRef)
      .then((snapshot) => {
        let listclothing = [] as ClothingProps[]

        snapshot.forEach(doc => {
          listclothing.push({
            id: doc.id,
            name: doc.data().name,
            city: doc.data().city,
            price: doc.data().price,
            images: doc.data().images,
            uid: doc.data().uid
          })
        })
        setClothing(listclothing);

      })
  }

  function handleImageLoad(id: string) {
    setLoadgImages((prevImageLoaded) => [...prevImageLoaded, id])
  }


  async function handleSearchClothing() {
    if (input === '') {
      loadCars();
      return;
    }
    setClothing([]);
    setLoadgImages([]);
    const q = query(collection(db, "clothing"),
      where("name", ">=", input.toUpperCase()),
      where("name", "<=", input.toUpperCase() + "\uf8ff")
    )
    const querySnapshot = await getDocs(q)

    let listclothing = [] as ClothingProps[];

    querySnapshot.forEach((doc) => {
      listclothing.push({
        id: doc.id,
        name: doc.data().name,
        city: doc.data().city,
        price: doc.data().price,
        images: doc.data().images,
        uid: doc.data().uid
      })
    }
    )

    setClothing(listclothing);
  }


  return (
    <Container>
      <div>
        <section className="bg-white p-4 rounded-lg w-full max-w-xl mx-auto flex justify-center items-center gap-2">
          <input
            className="w-full border-2 rounded-lg h-9 px-3 outline-none"
            placeholder="Digite o nome da roupa..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="bg-emerald-900 h-9 px-8 rounded-lg text-white font-medium text-lg cursor-pointer"
            onClick={handleSearchClothing}
          >
            Buscar
          </button>
        </section>
      </div>

      <h1 className="font-bold text-center mt-6 text-2xl mb-4">
        Roupas novas e seminovas em todo o Brasil
      </h1>


      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

        {clothing.map(clothing => (
          <Link key={clothing.id} to={`/clothing/${clothing.id}`}>
            <section className="w-full bg-white rounded-lg">
              <div
                className="w-full h-72 rounded-lg bg-slate-200"
                style={{ display: loadImages.includes(clothing.id) ? "none" : "block" }}
              ></div>
              <img
                className="w-full rounded-lg mb-2 max-h-72 hover:scale-105 transition-all"
                src={clothing.images[0].url}
                alt="Roupa"
                onLoad={() => handleImageLoad(clothing.id)}
                style={{ display: loadImages.includes(clothing.id) ? "block" : "none" }}
              />
              <p className="font-bold mt-1 mb-2 px-2">{clothing.name}</p>

              <div className="flex flex-col px-2">
                <strong className="text-black font-medium text-xl">R$ {clothing.price}</strong>
              </div>

              <div className="w-full h-px bg-slate-200 my-2"></div>

              <div className="px-2 pb-2">
                <span className="text-black">
                  {clothing.city}
                </span>
              </div>
            </section>
          </Link>

        ))}


      </main>


    </Container>
  )
}
