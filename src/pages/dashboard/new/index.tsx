import { type ChangeEvent, useState, useContext, useEffect } from "react";
import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/paneheader";

import { FiUpload, FiTrash } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { Input } from "../../../components/input";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "../../../contexts/AuthContext";
import { v4 as uuidV4 } from "uuid";
import { supabase } from "../../../services/supabaseConnection";
import { db } from "../../../services/firebaseConnection";
import { addDoc, collection } from "firebase/firestore";

import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().min(1, "O campo nome é obrigatório"),
  price: z.string().min(1, "O preço é obrigatório"),
  city: z.string().min(1, "A cidade é obrigatória"),
  whatsapp: z
    .string()
    .min(1, "O Telefone é obrigatório")
    .regex(/^\d+$/, "Número de telefone inválido"),
  description: z.string().min(1, "A descrição é obrigatória"),
});

type FormData = z.infer<typeof schema>;

interface ImagemItemProps {
  uid: string;
  name: string;
  previewUrl: string;
  url: string;
  path: string;
}

export function New() {
  const { user } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const [clothingImages, setClothingImages] = useState<ImagemItemProps[]>([]);

  async function handleFile(e: ChangeEvent<HTMLInputElement>, userUid?: string) {
    if (!e.target.files || !e.target.files[0]) return;
    const image = e.target.files[0];

    if (image.type !== "image/jpeg" && image.type !== "image/png") {
      toast.error("Envie uma imagem jpeg ou png!");
      return;
    }

    if (!userUid) {
      toast.error("Usuário não autenticado!");
      return;
    }

    await handleUpload(image, userUid);
  }

  async function handleUpload(image: File, userUid: string) {
    const uidImage = uuidV4();
    const path = `images/${userUid}/${uidImage}-${image.name}`;

    const { error } = await supabase.storage
      .from("imagens")
      .upload(path, image, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Erro ao enviar a imagem:", error.message);
      toast.error("Erro ao enviar a imagem");
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("imagens")
      .getPublicUrl(path);

    if (!urlData?.publicUrl) return null;

    const newImage: ImagemItemProps = {
      uid: uidImage,
      name: image.name,
      previewUrl: URL.createObjectURL(image),
      url: urlData.publicUrl,
      path,
    };

    setClothingImages((prev) => [...prev, newImage]);
    toast.success("Imagem cadastrada com sucesso");

    return urlData.publicUrl;
  }

  async function onSubmit(data: FormData) {
    if (!user?.uid) {
      toast.error("Você precisa estar logado para cadastrar.");
      return;
    }

    if (clothingImages.length === 0) {
      toast.error("Envie pelo menos 1 imagem!");
      return;
    }

    const clothingListImages = clothingImages.map((clothing) => ({
      uid: clothing.uid,
      name: clothing.name,
      url: clothing.url,
      path: clothing.path,
    }));

    const newClothing = {
      name: data.name.toUpperCase(),
      whatsapp: data.whatsapp,
      city: data.city,
      price: Number(data.price), // 🔹 garantir que seja number
      description: data.description,
      created: new Date(),
      owner: user?.name ?? "Usuário",
      uid: user.uid,
      images: clothingListImages,
    };

    console.log("🔥 Enviando para Firestore:", newClothing);

    try {
      await addDoc(collection(db, "clothing"), newClothing);
      reset();
      setClothingImages([]);
      toast.success("Roupa cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar a roupa:", error);
      toast.error("Erro ao cadastrar a roupa.");
    }
  }

  async function handleDeleteImage(item: ImagemItemProps) {
    try {
      const { error } = await supabase.storage.from("imagens").remove([item.path]);

      if (error) {
        console.error("Erro ao deletar imagem:", error.message);
        toast.error("Erro ao deletar imagem");
        return;
      }

      URL.revokeObjectURL(item.previewUrl);

      setClothingImages((prev) =>
        prev.filter((clothing) => clothing.uid !== item.uid)
      );

      toast.success("Imagem deletada com sucesso!");
    } catch (err) {
      console.error("ERRO AO DELETAR:", err);
    }
  }

  useEffect(() => {
    return () => {
      clothingImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [clothingImages]);

  return (
    <Container>
      <DashboardHeader />

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <div className="border-2 w-48 h-32 rounded-lg flex items-center justify-center border-gray-600 relative overflow-hidden">
          <FiUpload size={30} color="#000" className="pointer-events-none" />
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleFile(e, user?.uid)}
          />
        </div>

        {clothingImages.map((item) => (
          <div
            key={item.uid}
            className="w-full h-32 flex items-center justify-center relative"
          >
            <button
              type="button"
              className="absolute cursor-pointer"
              onClick={() => handleDeleteImage(item)}
            >
              <FiTrash size={28} color="#FFF" />
            </button>
            <img
              src={item.previewUrl}
              className="rounded-lg w-full h-32 object-cover"
              alt="Foto da roupa"
            />
          </div>
        ))}
      </div>

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 m-2">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <p className="mb-2 font-medium">Nome da peça</p>
          <div className="mb-3">
            <Input
              type="text"
              register={register}
              name="name"
              error={errors.name?.message}
              placeholder="Ex: Calça Jeans, Tamanho 38..."
            />
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Telefone/ Whatsapp</p>
              <Input
                type="text"
                register={register}
                name="whatsapp"
                error={errors.whatsapp?.message}
                placeholder="Ex: 43998008265"
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium">Cidade</p>
              <Input
                type="text"
                register={register}
                name="city"
                error={errors.city?.message}
                placeholder="Ex: Londrina - PR"
              />
            </div>
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Preço</p>
            <Input
              type="text"
              register={register}
              name="price"
              error={errors.price?.message}
              placeholder="Ex: 35.00"
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Descrição</p>
            <textarea
              className="border-2 w-full rounded-md h-24 px-2"
              {...register("description")}
              id="description"
              placeholder="Digite a descrição completa sobre a roupa..."
            />
            {errors.description && (
              <p className="mt-1 text-red-500">{errors.description.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 text-white font-medium h-10 cursor-pointer"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </Container>
  );
}
