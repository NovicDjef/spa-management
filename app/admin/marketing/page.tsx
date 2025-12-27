'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import {
  Mail,
  Phone,
  Download,
  Copy,
  Check,
  Filter,
  Send,
  Users,
  Loader2,
  TrendingUp,
  Target,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Eye,
  X,
  Clock,
} from 'lucide-react';
import {
  useGetMarketingContactsQuery,
  useSendIndividualEmailMutation,
  useSendCampaignEmailMutation,
  useGetMarketingStatsQuery,
  useGenerateMarketingMessageMutation,
  useSendAiCampaignMutation,
  type MarketingContact
} from '@/lib/redux/services/api';
import { useAppSelector } from '@/lib/redux/hooks';
import { hasPermission } from '@/lib/permissions';
import Link from 'next/link';

export default function MarketingPage() {
  const router = useRouter();
  const currentUser = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const [isMounted, setIsMounted] = useState(false);

  // Éviter l'erreur d'hydratation
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Vérifier les permissions
  useEffect(() => {
    if (isMounted && (!currentUser || !hasPermission(currentUser.role, 'VIEW_MARKETING'))) {
      router.push('/professionnel/connexion');
    }
  }, [currentUser, router, isMounted]);

  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState<'MASSOTHERAPIE' | 'ESTHETIQUE' | ''>('');
  const [lastVisitMonths, setLastVisitMonths] = useState<number | undefined>(undefined);
  const [genderFilter, setGenderFilter] = useState<'HOMME' | 'FEMME' | 'AUTRE' | ''>('');

  // Récupération des données avec les filtres
  const { data: contactsData, isLoading, refetch } = useGetMarketingContactsQuery({
    serviceType: serviceFilter || undefined,
    lastVisitMonths,
    gender: genderFilter || undefined,
    search: searchQuery || undefined,
  });

  const { data: statsData } = useGetMarketingStatsQuery();

  // Mutations pour envoi d'emails
  const [sendIndividualEmail, { isLoading: isSendingIndividual }] = useSendIndividualEmailMutation();
  const [sendCampaignEmail, { isLoading: isSendingCampaign }] = useSendCampaignEmailMutation();

  // Mutations pour génération AI
  const [generateMarketingMessage, { isLoading: isGenerating }] = useGenerateMarketingMessageMutation();
  const [sendAiCampaign, { isLoading: isSendingAiCampaign }] = useSendAiCampaignMutation();

  const contacts = contactsData?.contacts || [];
  const stats = statsData;

  // États pour la sélection
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [emailsCopied, setEmailsCopied] = useState(false);
  const [phonesCopied, setPhonesCopied] = useState(false);

  // États pour le modal d'envoi
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSending, setIsSending] = useState(false); // État local pour loader immédiat

  // États pour la génération AI
  const [aiPrompt, setAiPrompt] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState<{ subject: string; message: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [useAiMode, setUseAiMode] = useState(true); // Mode AI activé par défaut

  const handleSelectAll = () => {
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(contacts.map((c) => c.id)));
    }
  };

  const handleSelectContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const getSelectedContactsData = () => {
    return contacts.filter((c) => selectedContacts.has(c.id));
  };

  const copyAllEmails = () => {
    const selectedData = getSelectedContactsData();
    const emails = selectedData.length > 0
      ? selectedData.map((c) => c.courriel).join(', ')
      : contacts.map((c) => c.courriel).join(', ');

    navigator.clipboard.writeText(emails);
    setEmailsCopied(true);
    setTimeout(() => setEmailsCopied(false), 2000);
  };

  const copyAllPhones = () => {
    const selectedData = getSelectedContactsData();
    const phones = selectedData.length > 0
      ? selectedData.map((c) => c.telCellulaire).join(', ')
      : contacts.map((c) => c.telCellulaire).join(', ');

    navigator.clipboard.writeText(phones);
    setPhonesCopied(true);
    setTimeout(() => setPhonesCopied(false), 2000);
  };

  const exportToCSV = () => {
    // Téléchargement direct via l'API
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseUrl}/marketing/contacts/export${serviceFilter ? `?serviceType=${serviceFilter}` : ''}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `contacts-clients-${new Date().toISOString().split('T')[0]}.csv`;

    // Ajouter le token dans le header via fetch
    if (token) {
      fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.blob())
      .then(blob => {
        const downloadUrl = window.URL.createObjectURL(blob);
        link.href = downloadUrl;
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
      })
      .catch(error => {
        console.error('Erreur lors du téléchargement:', error);
        alert('Erreur lors du téléchargement du CSV');
      });
    }
  };

  const handleGenerateMessage = async () => {
    if (!aiPrompt.trim()) {
      alert('Veuillez entrer un prompt pour générer le message');
      return;
    }

    const selectedData = getSelectedContactsData();
    if (selectedData.length === 0) {
      alert('Veuillez sélectionner au moins un contact');
      return;
    }

    try {
      setSendResult(null);

      // Préparer les données complètes des clients sélectionnés
      const clientsData = selectedData.map(c => ({
        id: c.id,
        nom: c.nom,
        prenom: c.prenom,
        courriel: c.courriel,
        telCellulaire: c.telCellulaire,
        serviceType: c.serviceType,
      }));

      // Détecter le type de service majoritaire
      const massotherapieCount = selectedData.filter(c => c.serviceType === 'MASSOTHERAPIE').length;
      const esthetiqueCount = selectedData.filter(c => c.serviceType === 'ESTHETIQUE').length;

      let dominantServiceType: 'MASSOTHERAPIE' | 'ESTHETIQUE' | 'MIXTE';
      if (massotherapieCount > 0 && esthetiqueCount > 0) {
        dominantServiceType = 'MIXTE';
      } else if (massotherapieCount > 0) {
        dominantServiceType = 'MASSOTHERAPIE';
      } else {
        dominantServiceType = 'ESTHETIQUE';
      }

      const result = await generateMarketingMessage({
        prompt: aiPrompt,
        clientIds: selectedData.map(c => c.id),
        additionalContext: additionalContext || undefined,
        serviceType: dominantServiceType,
        spaName: 'Spa Renaissance',
        clients: clientsData,
      }).unwrap();

      setGeneratedMessage({
        subject: result.subject,
        message: result.message,
      });
      setEmailSubject(result.subject);
      setEmailMessage(result.message);

      // Afficher automatiquement la prévisualisation
      setShowPreview(true);

      setSendResult({
        success: true,
        message: `Message généré avec succès pour ${result.clientsCount} client(s)!`
      });

      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSendResult(null), 3000);

    } catch (error: any) {
      setSendResult({
        success: false,
        message: error?.data?.message || 'Erreur lors de la génération du message'
      });
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      alert('Veuillez remplir le sujet et le message');
      return;
    }

    const selectedData = getSelectedContactsData();
    if (selectedData.length === 0) {
      alert('Veuillez sélectionner au moins un contact');
      return;
    }

    // Activer le loader IMMÉDIATEMENT pour empêcher les doubles clics
    setIsSending(true);

    try {
      setSendResult(null);

      // ====================================
      // CAS 1: UN SEUL CLIENT (individuel)
      // ====================================
      if (selectedData.length === 1) {
        // ✅ Route: /api/marketing/send-email/individual
        // Utilisé pour TOUS les envois individuels (avec ou sans IA)
        const result = await sendIndividualEmail({
          clientId: selectedData[0].id,
          subject: emailSubject,
          message: emailMessage,
        }).unwrap();

        setSendResult({
          success: true,
          message: result.message
        });
      }
      // ====================================
      // CAS 2: PLUSIEURS CLIENTS (campagne)
      // ====================================
      else {
        // Avec IA: utiliser /api/marketing/send-email/campaign
        if (useAiMode && aiPrompt.trim()) {
          // ✅ Route: /api/marketing/send-email/campaign
          // Utilisé pour les campagnes de masse avec IA (avec placeholders {prenom} {nom})
          const result = await sendAiCampaign({
            clientIds: selectedData.map(c => c.id),
            subject: emailSubject,
            message: emailMessage,
            prompt: aiPrompt,
          }).unwrap();

          setSendResult({
            success: true,
            message: `${result.message}\n${result.totalSent} emails envoyés avec succès${result.totalFailed > 0 ? `, ${result.totalFailed} échecs` : ''}`
          });
        }
        // Sans IA: utiliser /api/marketing/send-email/campaign
        else {
          // ✅ Route: /api/marketing/send-email/campaign
          // Utilisé pour les campagnes de masse manuelles (sans IA)
          const result = await sendCampaignEmail({
            clientIds: selectedData.map(c => c.id),
            subject: emailSubject,
            message: emailMessage,
          }).unwrap();

          setSendResult({
            success: true,
            message: `${result.message}\n${result.totalSent} emails envoyés avec succès${result.totalFailed > 0 ? `, ${result.totalFailed} échecs` : ''}`
          });
        }
      }

      // Réinitialiser après succès ET désactiver le loader juste avant la fermeture du modal
      setTimeout(() => {
        setShowMessageModal(false);
        setEmailSubject('');
        setEmailMessage('');
        setAiPrompt('');
        setAdditionalContext('');
        setGeneratedMessage(null);
        setSelectedContacts(new Set());
        setSendResult(null);
        setIsSending(false); // ✅ Désactiver le loader SEULEMENT quand le modal disparaît
      }, 3000);

    } catch (error: any) {
      setSendResult({
        success: false,
        message: error?.data?.message || 'Erreur lors de l\'envoi des emails'
      });
      // En cas d'erreur, désactiver le loader immédiatement
      setIsSending(false);
    }
  };

  // Attendre le montage pour éviter l'erreur d'hydratation
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-turquoise-50">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-spa-turquoise-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-turquoise-50">
      <Header user={currentUser ?? undefined} />

      <div className="container-spa py-8">
        {/* Boutons de navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-spa-turquoise-600 hover:text-spa-turquoise-700 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Retour au tableau de bord</span>
          </Link>
          <Link
            href="/admin/marketing/history"
            className="inline-flex items-center gap-2 px-4 py-2 bg-spa-lavande-100 text-spa-lavande-700 rounded-xl hover:bg-spa-lavande-200 transition-colors font-medium"
          >
            <Clock className="w-4 h-4" />
            <span>Historique des campagnes</span>
          </Link>
        </motion.div>
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-spa-turquoise-100 to-spa-turquoise-200 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-spa-turquoise-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Campagnes Marketing</h1>
              <p className="text-gray-600">
                {contacts.length} contact{contacts.length !== 1 ? 's' : ''} • {selectedContacts.size} sélectionné{selectedContacts.size !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 flex items-start gap-3">
            <div className="w-2 h-2 bg-spa-turquoise-500 rounded-full mt-2"></div>
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Gestion des campagnes marketing</p>
              <p className="text-gray-600">
                Filtrez et exportez les données clients pour vos campagnes marketing. Envoyez des messages ciblés par email.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Statistiques */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="card-spa p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total clients</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalClients}</p>
                </div>
                <Users className="w-8 h-8 text-spa-turquoise-400" />
              </div>
            </div>

            <div className="card-spa p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Nouveaux (30j)</p>
                  <p className="text-2xl font-bold text-green-600">{stats.newClientsLast30Days}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="card-spa p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactifs (3 mois)</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.inactiveClients3Months}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-400" />
              </div>
            </div>

            <div className="card-spa p-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Répartition</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Massothérapie:</span>
                    <span className="font-medium">{stats.clientsByService.MASSOTHERAPIE}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Esthétique:</span>
                    <span className="font-medium">{stats.clientsByService.ESTHETIQUE}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <button
            onClick={copyAllEmails}
            className="card-spa flex items-center gap-3 hover:scale-105 cursor-pointer p-4"
          >
            {emailsCopied ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Mail className="w-5 h-5 text-spa-turquoise-600" />
            )}
            <div className="text-left">
              <p className="font-medium text-gray-800">
                {emailsCopied ? 'Copié!' : 'Copier emails'}
              </p>
              <p className="text-xs text-gray-600">
                {selectedContacts.size > 0 ? `${selectedContacts.size} sélectionnés` : 'Tous les contacts'}
              </p>
            </div>
          </button>

          <button
            onClick={copyAllPhones}
            className="card-spa flex items-center gap-3 hover:scale-105 cursor-pointer p-4"
          >
            {phonesCopied ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Phone className="w-5 h-5 text-spa-lavande-600" />
            )}
            <div className="text-left">
              <p className="font-medium text-gray-800">
                {phonesCopied ? 'Copié!' : 'Copier téléphones'}
              </p>
              <p className="text-xs text-gray-600">
                {selectedContacts.size > 0 ? `${selectedContacts.size} sélectionnés` : 'Tous les contacts'}
              </p>
            </div>
          </button>

          <button
            onClick={exportToCSV}
            className="card-spa flex items-center gap-3 hover:scale-105 cursor-pointer p-4"
          >
            <Download className="w-5 h-5 text-spa-menthe-600" />
            <div className="text-left">
              <p className="font-medium text-gray-800">Exporter CSV</p>
              <p className="text-xs text-gray-600">
                {selectedContacts.size > 0 ? `${selectedContacts.size} sélectionnés` : 'Tous les contacts'}
              </p>
            </div>
          </button>

          <button
            onClick={() => setShowMessageModal(true)}
            disabled={selectedContacts.size === 0}
            className="card-spa flex items-center gap-3 hover:scale-105 cursor-pointer p-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Send className="w-5 h-5 text-spa-turquoise-600" />
            <div className="text-left">
              <p className="font-medium text-gray-800">Envoyer email</p>
              <p className="text-xs text-gray-600">
                {selectedContacts.size > 0 ? `À ${selectedContacts.size} contact(s)` : 'Sélectionnez des contacts'}
              </p>
            </div>
          </button>
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 glass rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-spa-turquoise-600" />
            <h3 className="font-semibold text-gray-800">Filtres</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div>
              <label className="label-spa">Rechercher</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nom, email, téléphone..."
                className="input-spa"
              />
            </div>

            {/* Type de service */}
            <div>
              <label className="label-spa">Type de service</label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value as any)}
                className="input-spa"
              >
                <option value="">Tous les services</option>
                <option value="MASSOTHERAPIE">Massothérapie</option>
                <option value="ESTHETIQUE">Soins esthétiques</option>
              </select>
            </div>

            {/* Inactivité */}
            <div>
              <label className="label-spa">Inactivité client</label>
              <select
                value={lastVisitMonths || ''}
                onChange={(e) => setLastVisitMonths(e.target.value ? parseInt(e.target.value) : undefined)}
                className="input-spa"
              >
                <option value="">Tous les clients</option>
                <option value="1">Pas de visite depuis 1 mois</option>
                <option value="2">Pas de visite depuis 2 mois</option>
                <option value="3">Pas de visite depuis 3 mois</option>
                <option value="6">Pas de visite depuis 6 mois</option>
                <option value="12">Pas de visite depuis 1 an</option>
              </select>
            </div>

            {/* Genre */}
            <div>
              <label className="label-spa">Genre</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value as any)}
                className="input-spa"
              >
                <option value="">Tous les genres</option>
                <option value="FEMME">Femme</option>
                <option value="HOMME">Homme</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Table des contacts */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-spa-turquoise-500 animate-spin" />
          </div>
        ) : contacts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun contact trouvé</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Essayez de modifier vos critères de recherche
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="card-spa overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-spa-turquoise-50">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedContacts.size === contacts.length}
                        onChange={handleSelectAll}
                        className="checkbox-spa"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nom</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Téléphone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Service</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Dernière visite</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Inactivité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className={`hover:bg-spa-turquoise-50 transition-colors ${
                        selectedContacts.has(contact.id) ? 'bg-spa-turquoise-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedContacts.has(contact.id)}
                          onChange={() => handleSelectContact(contact.id)}
                          className="checkbox-spa"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{contact.nomComplet}</p>
                        {contact.gender && (
                          <p className="text-xs text-gray-500">{contact.gender}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{contact.courriel}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{contact.telCellulaire}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`badge ${
                            contact.serviceType === 'MASSOTHERAPIE'
                              ? 'badge-massotherapie'
                              : 'badge-esthetique'
                          }`}
                        >
                          {contact.serviceType === 'MASSOTHERAPIE' ? 'Massothérapie' : 'Esthétique'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {contact.derniereVisite
                          ? new Date(contact.derniereVisite).toLocaleDateString('fr-FR')
                          : 'Jamais'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {contact.joursSansVisite !== null ? (
                         <span
                          className={`font-medium ${
                            (contact.joursSansVisite ?? 0) > 90
                              ? 'text-red-600'
                              : (contact.joursSansVisite ?? 0) > 60
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}
                        >
                          {contact.joursSansVisite !== null ? `${contact.joursSansVisite} jours` : 'Jamais'}
                        </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal d'envoi d'email avec IA */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Envoyer un email à {selectedContacts.size} contact(s)
              </h2>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setEmailSubject('');
                  setEmailMessage('');
                  setAiPrompt('');
                  setAdditionalContext('');
                  setGeneratedMessage(null);
                  setSendResult(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Toggle Mode AI / Manuel */}
            <div className="mb-6 flex items-center gap-4 p-4 bg-gradient-to-r from-spa-turquoise-50 to-spa-lavande-50 rounded-xl">
              <button
                onClick={() => setUseAiMode(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  useAiMode
                    ? 'bg-white shadow-md text-spa-turquoise-700'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Mode IA
              </button>
              <button
                onClick={() => setUseAiMode(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  !useAiMode
                    ? 'bg-white shadow-md text-spa-turquoise-700'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <Mail className="w-4 h-4" />
                Mode Manuel
              </button>
            </div>

            {/* Résultat d'envoi ou génération */}
            {sendResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-xl ${
                  sendResult.success
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-red-50 border-2 border-red-200'
                }`}
              >
                <p
                  className={`font-medium ${
                    sendResult.success ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {sendResult.message}
                </p>
              </motion.div>
            )}

            {/* Section IA */}
            {useAiMode && (
              <div className="mb-6 space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border-2 border-purple-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-800">Génération avec Intelligence Artificielle</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Décrivez votre campagne marketing et l'IA générera automatiquement un message professionnel et personnalisé.
                  </p>

                  {/* Prompt */}
                  <div className="mb-4">
                    <label className="label-spa">
                      Décrivez votre campagne <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Ex: Proposer une réduction de 10% sur les massages pour les clients inactifs depuis 3 mois"
                      rows={3}
                      className="input-spa resize-none"
                      disabled={isGenerating}
                    />
                  </div>

                  {/* Contexte additionnel */}
                  <div className="mb-4">
                    <label className="label-spa">Contexte additionnel (optionnel)</label>
                    <input
                      type="text"
                      value={additionalContext}
                      onChange={(e) => setAdditionalContext(e.target.value)}
                      placeholder="Ex: Clients qui n'ont pas visité depuis 3 mois"
                      className="input-spa"
                      disabled={isGenerating}
                    />
                  </div>

                  {/* Bouton de génération */}
                  <button
                    onClick={handleGenerateMessage}
                    disabled={!aiPrompt.trim() || isGenerating}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 inline" />
                        Générer le message avec IA
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Sujet généré */}
            {generatedMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <label className="label-spa">Sujet de l'email généré</label>
                <div className="p-4 bg-spa-turquoise-50 border-2 border-spa-turquoise-200 rounded-xl">
                  <p className="text-gray-800 font-medium">{emailSubject}</p>
                </div>
              </motion.div>
            )}

            {/* Aperçu du message généré */}
            {generatedMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <label className="label-spa">Aperçu du message personnalisé</label>
                  <button
                    onClick={() => setShowPreview(true)}
                    className="text-sm text-spa-turquoise-600 hover:text-spa-turquoise-700 flex items-center gap-1 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Voir en grand
                  </button>
                </div>

                {/* Info de personnalisation */}
                <div className="mb-3 p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-purple-800">
                      <p className="font-semibold mb-1">Message personnalisé pour chaque client</p>
                      <p>
                        Exemple ci-dessous avec <span className="font-medium">{getSelectedContactsData()[0]?.prenom} {getSelectedContactsData()[0]?.nom}</span>.
                        Chaque client recevra le même message avec son propre nom et prénom.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Aperçu avec remplacement du premier client */}
                <div className="border-2 border-gray-200 rounded-xl p-6 bg-white max-h-96 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{
                    __html: generatedMessage.message
                      .replace(/{prenom}/gi, getSelectedContactsData()[0]?.prenom || '{prenom}')
                      .replace(/{nom}/gi, getSelectedContactsData()[0]?.nom || '{nom}')
                  }} />
                </div>

                <div className="mt-3 space-y-2">
                  <p className="text-xs text-spa-turquoise-600 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Le message inclut le logo Spa Renaissance et est formaté professionnellement
                  </p>
                  <p className="text-xs text-purple-600 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {selectedContacts.size} message(s) personnalisé(s) seront envoyés
                  </p>
                </div>
              </motion.div>
            )}

            {/* Mode manuel - formulaire classique */}
            {!useAiMode && (
              <>
                <div className="mb-4">
                  <label className="label-spa">Sujet de l'email</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Sujet de l'email"
                    className="input-spa"
                    disabled={isSending || isSendingCampaign || isSendingIndividual || isSendingAiCampaign}
                  />
                </div>

                <div className="mb-4">
                  <label className="label-spa">Message</label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Écrivez votre message ici..."
                    rows={10}
                    className="input-spa resize-none"
                    disabled={isSending || isSendingCampaign || isSendingIndividual || isSendingAiCampaign}
                  />
                </div>
              </>
            )}

            {/* Informations sur les destinataires */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Destinataires ({selectedContacts.size})
              </p>
              <div className="flex flex-wrap gap-2">
                {getSelectedContactsData().slice(0, 5).map((contact) => (
                  <div
                    key={contact.id}
                    className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs"
                  >
                    {contact.nomComplet}
                  </div>
                ))}
                {selectedContacts.size > 5 && (
                  <div className="px-3 py-1 bg-spa-turquoise-100 border border-spa-turquoise-200 rounded-lg text-xs font-medium text-spa-turquoise-700">
                    +{selectedContacts.size - 5} autres
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setEmailSubject('');
                  setEmailMessage('');
                  setAiPrompt('');
                  setAdditionalContext('');
                  setGeneratedMessage(null);
                  setSendResult(null);
                }}
                disabled={isSending || isSendingCampaign || isSendingIndividual || isSendingAiCampaign}
                className="btn-outline flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleSendEmail}
                disabled={!emailSubject.trim() || !emailMessage.trim() || isSending || isSendingCampaign || isSendingIndividual || isSendingAiCampaign}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending || isSendingCampaign || isSendingIndividual || isSendingAiCampaign ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2 inline" />
                    Envoyer à {selectedContacts.size} client(s)
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de prévisualisation */}
      {showPreview && generatedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Aperçu du message personnalisé</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Exemple avec {getSelectedContactsData()[0]?.prenom} {getSelectedContactsData()[0]?.nom}
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Info importante */}
            <div className="mb-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-purple-800">
                  <p className="font-semibold mb-2">Personnalisation automatique</p>
                  <p className="mb-2">
                    Le message ci-dessous est un <span className="font-medium">exemple</span> avec le nom du premier client sélectionné.
                  </p>
                  <p className="font-medium text-purple-900">
                    Lors de l'envoi, chaque client recevra ce message avec son propre nom et prénom.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4 p-4 bg-spa-turquoise-50 rounded-xl">
              <p className="text-sm font-medium text-gray-700 mb-1">Sujet:</p>
              <p className="text-gray-900 font-medium">{generatedMessage.subject}</p>
            </div>

            <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
              <div dangerouslySetInnerHTML={{
                __html: generatedMessage.message
                  .replace(/{prenom}/gi, getSelectedContactsData()[0]?.prenom || '{prenom}')
                  .replace(/{nom}/gi, getSelectedContactsData()[0]?.nom || '{nom}')
              }} />
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{selectedContacts.size} client(s) recevront ce message personnalisé</span>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="btn-primary"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
