import { useMemo } from 'react';
import { useGetAvailabilityBlocksQuery, useGetBreaksQuery } from '@/lib/redux/services/api';

/**
 * Hook personnalisé pour récupérer les blocages et pauses de plusieurs professionnels
 * Respecte les règles des hooks de React en utilisant un nombre fixe de hooks
 */
export function useAvailabilityData(
  professionalIds: string[],
  date: string
) {
  // Utiliser jusqu'à 10 hooks (nombre fixe) pour éviter les violations des règles de hooks
  // Si vous avez plus de 10 professionnels, augmentez ce nombre
  const MAX_PROFESSIONALS = 10;

  // Créer un tableau fixe de 10 IDs (rempli avec des chaînes vides si moins de 10)
  const fixedIds = useMemo(() => {
    const ids = [...professionalIds];
    while (ids.length < MAX_PROFESSIONALS) {
      ids.push('');
    }
    return ids.slice(0, MAX_PROFESSIONALS);
  }, [professionalIds]);

  // Appeler exactement 10 hooks (nombre fixe)
  const block0 = useGetAvailabilityBlocksQuery(
    { professionalId: fixedIds[0], startDate: date, endDate: date },
    { skip: !fixedIds[0] }
  );
  const block1 = useGetAvailabilityBlocksQuery(
    { professionalId: fixedIds[1], startDate: date, endDate: date },
    { skip: !fixedIds[1] }
  );
  const block2 = useGetAvailabilityBlocksQuery(
    { professionalId: fixedIds[2], startDate: date, endDate: date },
    { skip: !fixedIds[2] }
  );
  const block3 = useGetAvailabilityBlocksQuery(
    { professionalId: fixedIds[3], startDate: date, endDate: date },
    { skip: !fixedIds[3] }
  );
  const block4 = useGetAvailabilityBlocksQuery(
    { professionalId: fixedIds[4], startDate: date, endDate: date },
    { skip: !fixedIds[4] }
  );
  const block5 = useGetAvailabilityBlocksQuery(
    { professionalId: fixedIds[5], startDate: date, endDate: date },
    { skip: !fixedIds[5] }
  );
  const block6 = useGetAvailabilityBlocksQuery(
    { professionalId: fixedIds[6], startDate: date, endDate: date },
    { skip: !fixedIds[6] }
  );
  const block7 = useGetAvailabilityBlocksQuery(
    { professionalId: fixedIds[7], startDate: date, endDate: date },
    { skip: !fixedIds[7] }
  );
  const block8 = useGetAvailabilityBlocksQuery(
    { professionalId: fixedIds[8], startDate: date, endDate: date },
    { skip: !fixedIds[8] }
  );
  const block9 = useGetAvailabilityBlocksQuery(
    { professionalId: fixedIds[9], startDate: date, endDate: date },
    { skip: !fixedIds[9] }
  );

  // Même chose pour les pauses
  const break0 = useGetBreaksQuery(fixedIds[0], { skip: !fixedIds[0] });
  const break1 = useGetBreaksQuery(fixedIds[1], { skip: !fixedIds[1] });
  const break2 = useGetBreaksQuery(fixedIds[2], { skip: !fixedIds[2] });
  const break3 = useGetBreaksQuery(fixedIds[3], { skip: !fixedIds[3] });
  const break4 = useGetBreaksQuery(fixedIds[4], { skip: !fixedIds[4] });
  const break5 = useGetBreaksQuery(fixedIds[5], { skip: !fixedIds[5] });
  const break6 = useGetBreaksQuery(fixedIds[6], { skip: !fixedIds[6] });
  const break7 = useGetBreaksQuery(fixedIds[7], { skip: !fixedIds[7] });
  const break8 = useGetBreaksQuery(fixedIds[8], { skip: !fixedIds[8] });
  const break9 = useGetBreaksQuery(fixedIds[9], { skip: !fixedIds[9] });

  // Merger tous les résultats
  const allBlocks = useMemo(() => {
    const queries = [block0, block1, block2, block3, block4, block5, block6, block7, block8, block9];
    return queries
      .filter(query => query.data?.data)
      .flatMap(query => query.data!.data);
  }, [block0, block1, block2, block3, block4, block5, block6, block7, block8, block9]);

  const allBreaks = useMemo(() => {
    const queries = [break0, break1, break2, break3, break4, break5, break6, break7, break8, break9];
    return queries
      .filter(query => query.data?.data)
      .flatMap(query => query.data!.data);
  }, [break0, break1, break2, break3, break4, break5, break6, break7, break8, break9]);

  // Vérifier si toutes les queries sont en cours de chargement
  const isLoading = [
    block0, block1, block2, block3, block4, block5, block6, block7, block8, block9,
    break0, break1, break2, break3, break4, break5, break6, break7, break8, break9
  ].some(query => query.isLoading);

  return {
    blocks: allBlocks,
    breaks: allBreaks,
    isLoading,
  };
}
