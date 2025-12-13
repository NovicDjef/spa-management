import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Vérifier l'unicité de l'email
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.courriel },
    });

    if (existingEmail) {
      return NextResponse.json(
        { message: 'Cet email est déjà utilisé. Veuillez utiliser un autre email.' },
        { status: 400 }
      );
    }

    // Vérifier l'unicité du téléphone
    const existingPhone = await prisma.user.findUnique({
      where: { telephone: data.telCellulaire },
    });

    if (existingPhone) {
      return NextResponse.json(
        { message: 'Ce numéro de téléphone est déjà utilisé. Veuillez utiliser un autre numéro.' },
        { status: 400 }
      );
    }

    // Créer l'utilisateur et le profil client dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'utilisateur
      const user = await tx.user.create({
        data: {
          email: data.courriel,
          telephone: data.telCellulaire,
          role: 'CLIENT',
        },
      });

      // Créer le profil client
      const clientProfile = await tx.clientProfile.create({
        data: {
          userId: user.id,
          nom: data.nom,
          prenom: data.prenom,
          adresse: data.adresse,
          ville: data.ville,
          codePostal: data.codePostal,
          telMaison: data.telMaison || '',
          telBureau: data.telBureau || '',
          telCellulaire: data.telCellulaire,
          courriel: data.courriel,
          dateNaissance: new Date(data.dateNaissance),
          occupation: data.occupation || '',
          gender: data.gender,
          serviceType: data.serviceType,
          assuranceCouvert: data.assuranceCouvert === 'OUI',

          // Informations médicales (massothérapie)
          raisonConsultation: data.raisonConsultation || null,
          diagnosticMedical: data.diagnosticMedical === 'OUI',
          diagnosticMedicalDetails: data.diagnosticMedicalDetails || null,
          medicaments: data.medicaments === 'OUI',
          medicamentsDetails: data.medicamentsDetails || null,
          accidents: data.accidents === 'OUI',
          accidentsDetails: data.accidentsDetails || null,
          operationsChirurgicales: data.operationsChirurgicales === 'OUI',
          operationsChirurgicalesDetails: data.operationsChirurgicalesDetails || null,
          traitementsActuels: data.traitementsActuels || null,
          problemesCardiaques: data.problemesCardiaques || false,
          problemesCardiaquesDetails: data.problemesCardiaquesDetails || null,
          maladiesGraves: data.maladiesGraves || false,
          maladiesGravesDetails: data.maladiesGravesDetails || null,
          ortheses: data.ortheses || false,
          orthesesDetails: data.orthesesDetails || null,
          allergies: data.allergies || false,
          allergiesDetails: data.allergiesDetails || null,

          // Conditions médicales
          raideurs: data.raideurs || false,
          arthrose: data.arthrose || false,
          hernieDiscale: data.hernieDiscale || false,
          oedeme: data.oedeme || false,
          tendinite: data.tendinite || false,
          mauxDeTete: data.mauxDeTete || false,
          flatulence: data.flatulence || false,
          troublesCirculatoires: data.troublesCirculatoires || false,
          hypothyroidie: data.hypothyroidie || false,
          diabete: data.diabete || false,
          stresse: data.stresse || false,
          premenopause: data.premenopause || false,
          douleurMusculaire: data.douleurMusculaire || false,
          fibromyalgie: data.fibromyalgie || false,
          rhumatisme: data.rhumatisme || false,
          sciatique: data.sciatique || false,
          bursite: data.bursite || false,
          migraine: data.migraine || false,
          diarrhee: data.diarrhee || false,
          phlebite: data.phlebite || false,
          hypertension: data.hypertension || false,
          hypoglycemie: data.hypoglycemie || false,
          burnOut: data.burnOut || false,
          menopause: data.menopause || false,
          inflammationAigue: data.inflammationAigue || false,
          arteriosclerose: data.arteriosclerose || false,
          osteoporose: data.osteoporose || false,
          mauxDeDos: data.mauxDeDos || false,
          fatigueDesJambes: data.fatigueDesJambes || false,
          troublesDigestifs: data.troublesDigestifs || false,
          constipation: data.constipation || false,
          hyperthyroidie: data.hyperthyroidie || false,
          hypotension: data.hypotension || false,
          insomnie: data.insomnie || false,
          depressionNerveuse: data.depressionNerveuse || false,
          autres: data.autres || null,

          // Zones de douleur
          zonesDouleur: data.zonesDouleur || [],

          // Informations esthétique
          etatPeau: data.etatPeau || null,
          etatPores: data.etatPores || null,
          coucheCornee: data.coucheCornee || null,
          irrigationSanguine: data.irrigationSanguine || null,
          impuretes: data.impuretes || null,
          sensibiliteCutanee: data.sensibiliteCutanee || null,
          fumeur: data.fumeur || null,
          niveauStress: data.niveauStress || null,
          expositionSoleil: data.expositionSoleil || null,
          protectionSolaire: data.protectionSolaire || null,
          suffisanceEau: data.suffisanceEau || null,
          travailExterieur: data.travailExterieur || null,
          bainChauds: data.bainChauds || null,
          routineSoins: data.routineSoins || null,
          changementsRecents: data.changementsRecents || null,
          preferencePeau: data.preferencePeau || null,
          diagnosticVisuelNotes: data.diagnosticVisuelNotes || null,
        },
      });

      return { user, clientProfile };
    });

    return NextResponse.json(
      {
        message: 'Dossier client créé avec succès',
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création du dossier client' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const serviceType = searchParams.get('serviceType');

    let where: any = {};

    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { telCellulaire: { contains: search } },
        { adresse: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (serviceType) {
      where.serviceType = serviceType;
    }

    const clients = await prisma.clientProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            telephone: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ clients }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des clients' },
      { status: 500 }
    );
  }
}
