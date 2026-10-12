import {
  Directories,
  ExponatExtendedResponse,
  SpeciesResponse,
} from "@biosfera/types";
import toast from "react-hot-toast";
import { CreateExponatDto, useCreateExponat } from "@/api/useCreateExponat";
import { useReadOrCreateCategorization } from "@/api/useReadOrCreateCategorization";
import { useUpdateExponat } from "@/api/useUpdateExponat";
import { useUploadFile } from "@/api/useUploadFile";
import { useUploadThreeDimensionalModel } from "@/api/useUploadThreeDimensionalModel";
import { useUploadVideo } from "@/api/useUploadVideo";
import { isMineral } from "./exponatSchema";

export interface ExponatFiles {
  mainImage: File[];
  thirdDimensionalModel: File[];
  video: File[];
}

interface UseExponatSubmitParams {
  organisationId: string;
  isEdit?: boolean;
  values?: ExponatExtendedResponse;
  species?: SpeciesResponse[];
}

export const useExponatSubmit = ({
  organisationId,
  isEdit,
  values,
  species,
}: UseExponatSubmitParams) => {
  const { mutateAsync: readOrCreateCategorization } =
    useReadOrCreateCategorization();
  const { mutateAsync: createExponat } = useCreateExponat();
  const { mutateAsync: updateExponat } = useUpdateExponat();
  const { mutateAsync: uploadImage } = useUploadFile();
  const { mutateAsync: uploadModel } = useUploadThreeDimensionalModel();
  const { mutateAsync: uploadVideo } = useUploadVideo();

  // Resolves to the categorization id, null when the form cannot be
  // submitted, or undefined for minerals.
  const resolveCategorization = async (formData: any) => {
    const mineral = isMineral(formData.exponatKind);
    const match =
      mineral ||
      species?.find(
        (x: SpeciesResponse) => x.species === formData.alternateName,
      );

    if (!match && !isEdit) {
      alert("Nomenklatura nije validna");
      return null;
    }

    if (mineral) return undefined;

    const categorization = match as any;
    categorization.domain = formData.exponatKind;
    const speciesId = await readOrCreateCategorization(categorization);

    if (!speciesId) {
      toast.error("Greška prilikom kreiranja kategorizacije");
      return null;
    }

    return speciesId;
  };

  const uploadFiles = (files: ExponatFiles) => {
    const directory = Directories.EXPONAT;
    return Promise.all([
      files.mainImage[0] &&
        uploadImage({ file: files.mainImage[0], directory }),
      files.thirdDimensionalModel[0] &&
        uploadModel({ file: files.thirdDimensionalModel[0], directory }),
      files.video[0] && uploadVideo({ file: files.video[0], directory }),
    ]);
  };

  return async (formData: any, files: ExponatFiles) => {
    if (files.mainImage.length === 0 && !isEdit) {
      toast.error("Mora postojati glavna slika eksponata");
      return;
    }

    const categorizationId = await resolveCategorization(formData);
    if (categorizationId === null) return;

    const [mainImage, thirdDimensionalModel, video] = await uploadFiles(files);

    const request: CreateExponatDto = {
      alternateName: formData.alternateName,
      description: formData.description,
      funFacts: formData.funFacts,
      name: formData.name,
      authorshipInfoId: formData.authorshipInfoId,
      authorId: organisationId,
      ExponatKind: formData.exponatKind,
      mainImage,
      thirdDimensionalModel,
      video,
      attributes: JSON.stringify(formData.attributes) as any,
      categorizationId: categorizationId || undefined,
    };

    const action = isEdit
      ? await updateExponat({
          exponatId: values?.id as string,
          updateExponatDto: request,
        })
      : await createExponat({ organisationId, exponat: request });

    if (action) {
      setTimeout(() => {
        window.location.href = `/organisation/${organisationId}`;
      }, 2000);
    }
  };
};
