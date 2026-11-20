/**
 * La Clean Compagny – sauvegarde automatique de l'appli dans ce Google Sheets.
 *
 * Installation (une seule fois) :
 *   1. Dans le Google Sheets : Extensions > Apps Script.
 *   2. Effacez tout, collez ce fichier, enregistrez (icône disquette).
 *   3. En haut, choisissez la fonction « installer » puis « Exécuter ».
 *      Google demande l'autorisation : acceptez (Paramètres avancés > Accéder au projet).
 *
 * Ensuite tout est automatique : chaque heure, les onglets Clients, Prestations, Garages,
 * Devis et factures, Dépenses, Tâches et Formules sont remis à jour. Chaque lundi, une copie
 * complète du fichier est gardée dans le même dossier Drive (les 8 dernières).
 *
 * Sécurité : si l'appli renvoie d'un coup beaucoup moins de lignes qu'avant (données effacées
 * par erreur), l'onglet n'est PAS écrasé : l'ancienne version est gardée et l'onglet Infos le signale.
 */

const RPC_URL = 'https://ibeejsvztajwploqmnkh.supabase.co/rest/v1/rpc/backup_export'
const CLE_PUBLIQUE = 'sb_publishable_CuKd1nYk8S-txm_nDgWICg_criAYA9u'
const JETON = 'COLLER_LE_JETON_ICI'

// Ordre des colonnes dans chaque onglet (les autres suivent, l'identifiant technique en dernier).
const ORDRE = {
  Clients: ['created_at', 'nom', 'telephone', 'email', 'adresse', 'ville', 'vehicule', 'plaque', 'prestation', 'prix', 'statut', 'rdv', 'source', 'garage', 'code_parrain', 'parraine_par', 'recompenses_utilisees', 'notes'],
  Prestations: ['date', 'client', 'prestation', 'montant', 'paiement', 'remise', 'plaque', 'garage', 'notes'],
  Garages: ['date', 'garage', 'plaque', 'modele', 'preparation', 'tarif', 'facture', 'notes', 'created_at'],
  'Devis et factures': ['date', 'type', 'numero', 'client', 'total', 'statut', 'paye_le', 'lignes', 'notes'],
  Formules: ['created_at', 'client', 'formule', 'prix', 'tous_les_jours', 'prochain', 'active'],
}

function installer() {
  ScriptApp.getProjectTriggers()
    .filter((t) => ['sauvegarder', 'copieHebdo'].includes(t.getHandlerFunction()))
    .forEach((t) => ScriptApp.deleteTrigger(t))
  ScriptApp.newTrigger('sauvegarder').timeBased().everyHours(1).create()
  ScriptApp.newTrigger('copieHebdo').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(3).create()
  sauvegarder()
}

function sauvegarder() {
  const res = UrlFetchApp.fetch(RPC_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: { apikey: CLE_PUBLIQUE, Authorization: 'Bearer ' + CLE_PUBLIQUE },
    payload: JSON.stringify({ p_token: JETON }),
    muteHttpExceptions: true,
  })
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  if (res.getResponseCode() !== 200) {
    infos(ss, [['Erreur', new Date(), res.getResponseCode() + ' ' + res.getContentText().slice(0, 200)]])
    throw new Error('Sauvegarde impossible : ' + res.getContentText().slice(0, 300))
  }
  const data = JSON.parse(res.getContentText())
  const journal = []

  Object.keys(data)
    .filter((k) => k !== 'generated_at')
    .forEach((nom) => {
      const lignes = data[nom] || []
      const sh = ss.getSheetByName(nom) || ss.insertSheet(nom)
      const avant = Math.max(0, sh.getLastRow() - 1)
      // Garde-fou : on n'écrase pas une sauvegarde pleine par une liste presque vide.
      if (avant >= 5 && lignes.length < avant * 0.5) {
        journal.push([nom, new Date(), 'NON MIS À JOUR : ' + lignes.length + ' lignes reçues au lieu de ' + avant + ' (ancienne version gardée)'])
        return
      }
      const cols = (ORDRE[nom] || []).slice()
      lignes.forEach((r) => Object.keys(r).forEach((k) => cols.indexOf(k) === -1 && k !== 'id' && cols.push(k)))
      cols.push('id')
      sh.clearContents()
      if (!lignes.length) {
        sh.getRange(1, 1).setValue('Aucune donnée pour l’instant')
        journal.push([nom, new Date(), '0 ligne'])
        return
      }
      const valeurs = lignes.map((r) => cols.map((c) => cellule(r[c])))
      sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold')
      sh.getRange(2, 1, valeurs.length, cols.length).setValues(valeurs)
      sh.setFrozenRows(1)
      journal.push([nom, new Date(), lignes.length + ' lignes'])
    })

  // La feuille vide créée avec le fichier ne sert à rien.
  ;['Feuille 1', 'Sheet1'].forEach((n) => {
    const s = ss.getSheetByName(n)
    if (s && ss.getSheets().length > 1 && s.getLastRow() === 0) ss.deleteSheet(s)
  })
  infos(ss, journal)
}

function cellule(v) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'object') return JSON.stringify(v)
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v)) return new Date(v)
  return v
}

function infos(ss, journal) {
  const sh = ss.getSheetByName('Infos') || ss.insertSheet('Infos', 0)
  sh.clearContents()
  sh.getRange(1, 1, 2, 2).setValues([
    ['Dernière sauvegarde', new Date()],
    ['Source', 'Appli La Clean Compagny (mise à jour automatique toutes les heures)'],
  ])
  sh.getRange(1, 1, 2, 1).setFontWeight('bold')
  if (journal.length) {
    sh.getRange(4, 1, 1, 3).setValues([['Onglet', 'Heure', 'Résultat']]).setFontWeight('bold')
    sh.getRange(5, 1, journal.length, 3).setValues(journal)
  }
}

// Copie complète du fichier chaque lundi (les 8 dernières sont gardées).
function copieHebdo() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const fichier = DriveApp.getFileById(ss.getId())
  const dossier = fichier.getParents().hasNext() ? fichier.getParents().next() : DriveApp.getRootFolder()
  const nom = 'La Clean Compagny – copie du ' + Utilities.formatDate(new Date(), 'Europe/Paris', 'dd/MM/yyyy')
  fichier.makeCopy(nom, dossier)
  const copies = []
  const it = dossier.searchFiles("title contains 'La Clean Compagny – copie du'")
  while (it.hasNext()) copies.push(it.next())
  copies.sort((a, b) => b.getDateCreated() - a.getDateCreated())
  copies.slice(8).forEach((f) => f.setTrashed(true))
}
