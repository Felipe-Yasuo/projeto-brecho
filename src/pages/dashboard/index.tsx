
import { useEffect, useState, useContext } from "react";
import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/paneheader";

import { FiTrash2 } from 'react-icons/fi'

import { collection, getDocs, where, query, doc, deleteDoc } from 'firebase/firestore'
import { db } from "../../services/firebaseConnection";
import { AuthContext } from "../../contexts/AuthContext";
import { supabase } from "../../services/supabaseConnection";

interface ClothingProps {
  id: string;
  name: string;
  price: string | number;
  city: string;
  images: ImageClothingProps[];
  uid: string;
}


interface ImageClothingProps {
  name: string;
  uid: string;
  url: string;
  path: string;
}

export function Dashboard() {
  const [clothing, setClothing] = useState<ClothingProps[]>([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    function loadClothing() {
      if (!user?.uid) {
        return;
      }
      const clothingRef = collection(db, "clothing")
      const queryRef = query(clothingRef, where("uid", "==", user.uid))

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
    loadClothing();
  }, [user])

  async function handleDeleteClothing(item: ClothingProps) {
    try {
      const paths = item.images?.map(img => img.path) || [];

      if (paths.length > 0) {
        const { error } = await supabase.storage.from("imagens").remove(paths);
        if (error) {
          console.error("❌ Erro ao deletar imagens:", error.message);
        } else {
          console.log("✅ Imagens deletadas:", paths);
        }
      }

      await deleteDoc(doc(db, "clothing", item.id));

      // atualizar state corretamente
      setClothing(prev => prev.filter(c => c.id !== item.id));

    } catch (err) {
      console.error("Erro ao deletar a Roupa:", err);
    }
  }
  return (
    <Container>
      <DashboardHeader />
      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ">
        {clothing.map(clothing =>
          <section key={clothing.id} className="w-full bg-white rounded-lg relative">

            <button
              onClick={() => handleDeleteClothing(clothing)}
              className="absolute bg-white w-14 h-14 rounded-full flex items-center justify-center right-2 top-2 drop-shadow cursor-pointer">
              <FiTrash2 size={26} color="#000" />
            </button>
            <img
              className="w-full rounded-lg max-h-70 cursor-pointer"
              src={clothing.images[0].url}
            />
            <p className="font-bold mt-1 px-2 mb-2">{clothing.name}</p>

            <div className="flex flex-col px-2">
              <strong className="text-black font-bold mt-4">
                {clothing.price}
              </strong>

            </div>

            <div className="w-full h-px bg-slate-200 my-2"></div>
            <div className="px-2 pb-2">
              <span className="text-black">
                {clothing.city}
              </span>
            </div>
          </section>
        )}
      </main>
    </Container >
  )
}
