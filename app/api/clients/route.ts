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

// Fonction utilitaire pour décoder le token JWT
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Utiliser Buffer pour décoder en base64 (Node.js)
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64')
        .toString()
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

// Fonction pour récupérer l'utilisateur depuis le token
async function getCurrentUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = decodeJWT(token);
    
    if (!decoded || !decoded.id) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const serviceType = searchParams.get('serviceType');

    // Récupérer l'utilisateur connecté
    const currentUser = await getCurrentUser(request);

    let where: any = {};

    // Filtrer selon le rôle de l'utilisateur
    if (currentUser) {
      // Si l'utilisateur est MASSOTHERAPEUTE ou ESTHETICIENNE, ne retourner que les clients assignés
      if (currentUser.role === 'MASSOTHERAPEUTE' || currentUser.role === 'ESTHETICIENNE') {
        const assignments = await prisma.assignment.findMany({
          where: { professionalId: currentUser.id },
          select: { clientId: true },
        });

        const assignedClientIds = assignments.map((a) => a.clientId);

        if (assignedClientIds.length === 0) {
          // Aucun client assigné, retourner un tableau vide
          return NextResponse.json({ clients: [] }, { status: 200 });
        }

        where.id = { in: assignedClientIds };
      }
      // Si SECRETAIRE ou ADMIN, retourner tous les clients (pas de filtre supplémentaire)
    } else {
      // Pas d'utilisateur connecté, retourner un tableau vide
      return NextResponse.json({ clients: [] }, { status: 200 });
    }

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
        assignments: {
          where: currentUser && (currentUser.role === 'MASSOTHERAPEUTE' || currentUser.role === 'ESTHETICIENNE')
            ? { professionalId: currentUser.id }
            : undefined,
          select: {
            assignedAt: true,
          },
          orderBy: {
            assignedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Ajouter la date d'assignation aux clients
    const clientsWithAssignment = clients.map((client) => ({
      ...client,
      assignedAt: client.assignments?.[0]?.assignedAt || client.createdAt,
    }));

    return NextResponse.json({ clients: clientsWithAssignment }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des clients' },
      { status: 500 }
    );
  }
}
