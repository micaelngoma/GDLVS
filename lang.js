i18next.init({
  lng: "en",
  resources: {
    en: {
      translation: {
        appName: "GDLVS",
        dashboard: "Dashboard",
        licenses: "License Management",
        verify: "Verification Portal",
        analytics: "Analytics",
        analyticsOverview: "Analytics Overview",
        users: "User Management",
        logout: "Logout",
        licenseStatus: "License Status Distribution",
        verifyTrends: "Verification Requests Over Time",
        licensesByCountry: "Licenses by Country",
        active: "Active",
        inactive: "Inactive",
        verifications: "Verifications",
        licenses: "Licenses",
        unknown: "Unknown"
      }
    },
    fr: {
      translation: {
        appName: "GDLVS",
        dashboard: "Tableau de bord",
        licenses: "Gestion des permis",
        verify: "Portail de vérification",
        analytics: "Analytique",
        analyticsOverview: "Aperçu analytique",
        users: "Gestion des utilisateurs",
        logout: "Déconnexion",
        licenseStatus: "Répartition des permis",
        verifyTrends: "Demandes de vérification dans le temps",
        licensesByCountry: "Permis par pays",
        active: "Actifs",
        inactive: "Inactifs",
        verifications: "Vérifications",
        licenses: "Permis",
        unknown: "Inconnu"
      }
    },
    ja: {
      translation: {
        appName: "GDLVS",
        dashboard: "ダッシュボード",
        licenses: "免許管理",
        verify: "認証ポータル",
        analytics: "分析",
        analyticsOverview: "分析概要",
        users: "ユーザー管理",
        logout: "ログアウト",
        licenseStatus: "免許ステータスの分布",
        verifyTrends: "検証リクエストの推移",
        licensesByCountry: "国別免許数",
        active: "有効",
        inactive: "無効",
        verifications: "検証",
        licenses: "免許",
        unknown: "不明"
      }
    }
  }
}, function(err, t) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.innerHTML = i18next.t(el.getAttribute("data-i18n"));
  });
});

function changeLng(lng) {
  i18next.changeLanguage(lng, () => {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      el.innerHTML = i18next.t(el.getAttribute("data-i18n"));
    });
  });
}
