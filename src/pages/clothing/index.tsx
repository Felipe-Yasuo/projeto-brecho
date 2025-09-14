import { useEffect, useState } from 'react'
import { Container } from '../../components/container'
import { FaWhatsapp } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'

import { getDoc, doc } from 'firebase/firestore'
import { db } from '../../services/firebaseConnection'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface ClothingProps {
  id: string;
  name: string;
  city: string;
  description: string;
  created: string;
  price: string | number;
  owner: string;
  uid: string;
  whatsapp: string;
  images: ImageClothingProps[]
}

interface ImageClothingProps {
  uid: string;
  name: string;
  url: string;
  path: string;
}


export function ClothingDetail() {
  const { id } = useParams();
  const [clothing, setClothing] = useState<ClothingProps | null>(null)
  const [sliderPerView, setSliderPerView] = useState<number>(2)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate();

  useEffect(() => {
    async function loadClothing() {
      if (!id) return;

      try {
        const docRef = doc(db, "clothing", id);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
          setError("Produto não encontrado.");
          navigate("/");
          return;
        }

        const data = snapshot.data();
        setClothing({
          id: snapshot.id,
          name: data?.name,
          city: data?.city,
          description: data?.description,
          created: data?.created,
          price: data?.price,
          owner: data?.owner,
          uid: data?.uid,
          whatsapp: data?.whatsapp,
          images: data?.images || []
        });
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar o produto. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    loadClothing();
  }, [id, navigate]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 720) {
        setSliderPerView(1);
      } else {
        setSliderPerView(2);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    }
  }, []);

  if (loading) {
    return (
      <Container>
        <div className="w-full flex justify-center items-center h-96">
          <p className="text-xl font-medium text-gray-600 animate-pulse">
            Carregando produto...
          </p>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <div className="w-full flex justify-center items-center h-96">
          <p className="text-xl font-bold text-red-600">
            {error}
          </p>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      {clothing && clothing.images.length > 0 && (
        <Swiper
          modules={[Navigation, Pagination]}
          slidesPerView={sliderPerView}
          pagination={{ clickable: true }}
          navigation
        >
          {clothing.images.map((image) => (
            <SwiperSlide key={image.uid}>
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-96 object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {clothing && (
        <main className="w-full bg-white rounded-lg p-6 my-4">
          <div className="flex flex-col sm:flex-row mb-4 items-center justify-between">
            <h1 className="font-bold text-3xl text-black">{clothing.name}</h1>
            <h1 className="font-bold text-3xl text-black">
              R$ {clothing.price}
            </h1>
          </div>

          <div className="flex w-full gap-6 my-4">
            <div className="flex flex-col gap-4">
              <div>
                <p>Cidade</p>
                <strong>{clothing.city}</strong>
              </div>
            </div>
          </div>

          <strong>Descrição:</strong>
          <p className="mb-4">{clothing.description}</p>

          <strong>Telefone / Whatsapp</strong>
          <p>{clothing.whatsapp}</p>

          <a
            className="cursor-pointer bg-green-700 w-full text-white flex items-center justify-center gap-2 my-6 h-11 text-xl rounded-lg font-medium"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://api.whatsapp.com/send?phone=${clothing.whatsapp}&text=Olá vi esse ${clothing.name} no site Brechó Canales e fiquei interessado`}
          >
            Conversar com Vendedor
            <FaWhatsapp size={26} color="#FFF" />
          </a>
        </main>
      )}
    </Container>
  )
}
