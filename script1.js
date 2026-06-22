
const API_BASE = "https://zobbly.onrender.com";
    window.keywordInteractions = window.keywordInteractions || {};
    window.preferredKeyword = window.preferredKeyword || null;

    window.trackInteraction = function(postId) {
        if (window.preferredKeyword) return;
        if (!window.allPosts) return;

        const post = window.allPosts.find(p => p._id === postId);
        if (post && post.keywords && Array.isArray(post.keywords)) {
            post.keywords.forEach(kw => {
                if (!kw) return;
                const key = kw.toLowerCase().trim();
                window.keywordInteractions[key] = (window.keywordInteractions[key] || 0) + 1;
                
                if (window.keywordInteractions[key] >= 3 && !window.preferredKeyword) {
                    window.preferredKeyword = key;
                    console.log("Preferred keyword set to:", key);
                    if (document.getElementById('feed-container')) {
                        renderView('feed');
                    }
                }
            });
        }
    };

    let activeChatUser = null;
    let myFollowers = [];
    let myFollowing = [];
    let myBlockedUsers = [];
    let authContext = "";
    let pendingConfirmAction = null;
    let activeDropdownId = null;
    let isChatOpen = false; 
    let statusInterval = null; 
    const chatThemes = [
        { id: 'default', name: 'Default', bg: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', text: 'text-gray-800', btn: 'bg-purple-600', barColor: 'rgba(255, 255, 255, 0.9)' },
        { id: 'love', name: '❤️', bg: 'url(https://images.unsplash.com/photo-1559216406-beda67bab4fb?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)', text: 'text-white', btn: 'bg-pink-600', barColor: 'rgba(255, 230, 240, 0.95)' },
        { id: 'sad', name: '🌧️' , bg: 'url(https://images.unsplash.com/photo-1594087588915-6aa3c388474f?q=80&w=1288&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)', text: 'text-white', btn: 'bg-gray-600', barColor: 'rgba(230, 235, 240, 0.95)' },
        { id: 'angry', name: '🔥', bg: 'url(https://images.unsplash.com/photo-1772199303085-da403a353596?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)', text: 'text-white', btn: 'bg-red-700', barColor: 'rgba(255, 230, 230, 0.95)' },
        { id: 'nature', name: '🌿', bg: 'url(https://plus.unsplash.com/premium_photo-1751294864512-29c9f4ae008a?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)', text: 'text-white', btn: 'bg-green-600', barColor: 'rgba(230, 250, 230, 0.95)' },
        { id: 'galaxy', name: '🌌', bg: 'url(https://plus.unsplash.com/premium_photo-1676165852024-a4a28f878d2d?q=80&w=1352&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)', text: 'text-white', btn: 'bg-indigo-600', barColor: 'rgba(230, 230, 250, 0.95)' },
        { id: 'happy', name: '☀️', bg: 'url(https://plus.unsplash.com/premium_photo-1676068244542-8d4e24053b7a?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)', text: 'text-gray-800', btn: 'bg-yellow-500', barColor: 'rgba(255, 250, 230, 0.95)' },
        { id: 'night', name: '🌑', bg: 'url(https://images.unsplash.com/photo-1599939571322-792a326991f2?q=80&w=2052&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)', text: 'text-white', btn: 'bg-blue-900', barColor: 'rgba(200, 210, 230, 0.95)' },
        { id: 'ocean', name: '🌊', bg: 'url(https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=600)', text: 'text-white', btn: 'bg-cyan-600', barColor: 'rgba(220, 245, 255, 0.95)' },
        { id: 'sunset', name: '🌅', bg: 'url(https://images.unsplash.com/photo-1778244305115-4dd2bf7c8e86?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)', text: 'text-white', btn: 'bg-orange-600', barColor: 'rgba(255, 240, 230, 0.95)' },
        { id: 'tech', name: '💻', bg: 'url(https://images.unsplash.com/photo-1780663092036-0e6d6a960368?q=80&w=927&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)', text: 'text-white', btn: 'bg-blue-600', barColor: 'rgba(220, 230, 255, 0.95)' },
        { id: 'abstract', name: '🎨', bg: 'url(https://plus.unsplash.com/premium_photo-1769900514785-64a3206b7a1c?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)', text: 'text-white', btn: 'bg-pink-500', barColor: 'rgba(255, 235, 255, 0.95)' }
      
    
    ];
    let currentTheme = chatThemes.find(t => t.id === localStorage.getItem('savedChatThemeId')) || chatThemes[0];
   function receiveFcmToken(token) {
        localStorage.setItem("fcmToken", token);
        if (localStorage.getItem("token")) APIService.user.updateFcm(token);
    }
   
     const translations = {
        en: { settings: "Settings", editProfile: "Edit Profile", backup: "Backup Data", delete: "Delete Account", logout: "Logout", createPost: "Create Post", post: "Post", save: "Save Changes", experience: "Experience", activity: "Activity", followers: "Followers", following: "Following", follow: "Follow", unfollow: "Following", block: "Block", unblock: "Unblock", report: "Report", jobs: "Find Jobs", search: "Search", notifications: "Notifications", noPosts: "No posts yet.", back: "Back", message: "Message", clear: "Clear" },
        hi: { settings: "सेटिंग्स", editProfile: "प्रोफाइल बदलें", backup: "डाटा बैकअप", delete: "अकाउंट हटाएं", logout: "लॉग आउट", createPost: "पोस्ट बनाएं", post: "पोस्ट करें", save: "बदलाव सेव करें", experience: "अनुभव", activity: "गतिविधि", followers: "फॉलोअर्स", following: "फॉलोइंग", follow: "फॉलो करें", unfollow: "फॉलोइंग", block: "ब्लॉक करें", unblock: "अनब्लॉक", report: "रिपोर्ट", jobs: "नौकरी खोजें", search: "खोजें", notifications: "सूचनाएं", noPosts: "कोई पोस्ट नहीं", back: "वापस", message: "मैसेज", clear: "साफ़ करें" },
        es: { settings: "Ajustes", editProfile: "Editar Perfil", backup: "Copia de seguridad", delete: "Eliminar cuenta", logout: "Cerrar sesión", createPost: "Crear publicación", post: "Publicar", save: "Guardar", experience: "Experiencia", activity: "Actividad", followers: "Seguidores", following: "Siguiendo", follow: "Seguir", unfollow: "Siguiendo", block: "Bloquear", unblock: "Desbloquear", report: "Reportar", jobs: "Buscar Empleo", search: "Buscar", notifications: "Notificaciones", noPosts: "Aún no hay posts", back: "Atrás", message: "Mensaje", clear: "Limpiar" },
        fr: { settings: "Paramètres", editProfile: "Modifier profil", backup: "Sauvegarde", delete: "Supprimer compte", logout: "Déconnexion", createPost: "Créer un post", post: "Publier", save: "Enregistrer", experience: "Expérience", activity: "Activité", followers: "Abonnés", following: "Abonnements", follow: "Suivre", unfollow: "Abonné", block: "Bloquear", unblock: "Débloquer", report: "Signaler", jobs: "Emplois", search: "Rechercher", notifications: "Notifications", noPosts: "Pas de posts", back: "Retour", message: "Message", clear: "Effacer" },
        de: { settings: "Einstellungen", editProfile: "Profil bearbeiten", backup: "Backup", delete: "Konto löschen", logout: "Abmelden", createPost: "Beitrag erstellen", post: "Posten", save: "Speichern", experience: "Erfahrung", activity: "Aktivität", followers: "Follower", following: "Gefolgt", follow: "Folgen", unfollow: "Gefolgt", block: "Blockieren", unblock: "Entblocken", report: "Melden", jobs: "Jobs finden", search: "Suchen", notifications: "Benachrichtigungen", noPosts: "Keine Beiträge", back: "Zurück", message: "Nachricht", clear: "Löschen" },
        zh: { settings: "设置", editProfile: "编辑资料", backup: "备份数据", delete: "删除帐户", logout: "退出", createPost: "发帖", post: "发布", save: "保存", experience: "经历", activity: "动态", followers: "粉丝", following: "关注", follow: "关注", unfollow: "已关注", block: "拉黑", unblock: "解除拉黑", report: "举报", jobs: "找工作", search: "搜索", notifications: "通知", noPosts: "暂无帖子", back: "返回", message: "发消息", clear: "清除" },
        ja: { settings: "設定", editProfile: "プロフィール編集", backup: "バックアップ", delete: "アカウント削除", logout: "ログアウト", createPost: "投稿作成", post: "投稿", save: "保存", experience: "経験", activity: "アクティビティ", followers: "フォロワー", following: "フォロー中", follow: "フォロー", unfollow: "フォロー中", block: "ブロック", unblock: "解除", report: "通報", jobs: "仕事検索", search: "検索", notifications: "通知", noPosts: "投稿なし", back: "戻る", message: "メッセージ", clear: "クリア" },
        ru: { settings: "Настройки", editProfile: "Ред. профиль", backup: "Резервная копия", delete: "Удалить аккаунт", logout: "Выйти", createPost: "Создать пост", post: "Опубликовать", save: "Сохранить", experience: "Опыт", activity: "Активность", followers: "Подписчики", following: "Подписки", follow: "Подписаться", unfollow: "Вы подписаны", block: "Блок", unblock: "Разблок", report: "Жалоба", jobs: "Вакансии", search: "Поиск", notifications: "Уведомления", noPosts: "Нет постов", back: "Назад", message: "Сообщение", clear: "Очистить" },
        pt: { settings: "Configurações", editProfile: "Editar Perfil", backup: "Backup", delete: "Excluir Conta", logout: "Sair", createPost: "Criar Post", post: "Postar", save: "Salvar", experience: "Experiência", activity: "Atividade", followers: "Seguidores", following: "Seguindo", follow: "Seguir", unfollow: "Seguindo", block: "Bloquear", unblock: "Desbloquear", report: "Denunciar", jobs: "Vagas", search: "Buscar", notifications: "Notificações", noPosts: "Sem posts", back: "Voltar", message: "Mensagem", clear: "Limpar" },
        ar: { settings: "الإعدادات", editProfile: "تعديل الملف", backup: "نسخ احتياطي", delete: "حذف الحساب", logout: "خروج", createPost: "إنشاء منشور", post: "نشر", save: "حفظ", experience: "الخبرة", activity: "النشاط", followers: "المتابعون", following: "المتابَعون", follow: "متابعة", unfollow: "تتابع", block: "حظر", unblock: "إلغاء الحظر", report: "إبلاغ", jobs: "وظائف", search: "بحث", notifications: "إشعارات", noPosts: "لا منشورات", back: "عودة", message: "رسالة", clear: "مسح" },
        it: { settings: "Impostazioni", editProfile: "Modifica profilo", backup: "Backup", delete: "Elimina account", logout: "Esci", createPost: "Crea post", post: "Pubblica", save: "Salva", experience: "Esperienza", activity: "Attività", followers: "Follower", following: "Seguiti", follow: "Segui", unfollow: "Segui già", block: "Blocca", unblock: "Sblocca", report: "Segnala", jobs: "Lavoro", search: "Cerca", notifications: "Notifiche", noPosts: "Nessun post", back: "Indietro", message: "Messaggio", clear: "Pulisci" },
        ko: { settings: "설정", editProfile: "프로필 편집", backup: "백업", delete: "계정 삭제", logout: "로그아웃", createPost: "게시물 작성", post: "게시", save: "저장", experience: "경력", activity: "활동", followers: "팔로워", following: "팔로잉", follow: "팔로우", unfollow: "팔로잉", block: "차단", unblock: "해제", report: "신고", jobs: "구직", search: "검색", notifications: "알림", noPosts: "게시물 없음", back: "뒤로", message: "메시지", clear: "지우기" },
        tr: { settings: "Ayarlar", editProfile: "Profili Düzenle", backup: "Yedekle", delete: "Hesabı Sil", logout: "Çıkış", createPost: "Gönderi Yap", post: "Paylaş", save: "Kaydet", experience: "Deneyim", activity: "Aktivite", followers: "Takipçiler", following: "Takip", follow: "Takip Et", unfollow: "Takipte", block: "Engelle", unblock: "Aç", report: "Bildir", jobs: "İş Bul", search: "Ara", notifications: "Bildirimler", noPosts: "Gönderi yok", back: "Geri", message: "Mesaj", clear: "Temizle" },
        nl: { settings: "Instellingen", editProfile: "Profiel bewerken", backup: "Back-up", delete: "Account verwijderen", logout: "Uitloggen", createPost: "Post maken", post: "Plaatsen", save: "Opslaan", experience: "Ervaring", activity: "Activiteit", followers: "Volgers", following: "Volgend", follow: "Volgen", unfollow: "Volgend", block: "Blokkeren", unblock: "Deblokkeren", report: "Rapporteren", jobs: "Vacatures", search: "Zoeken", notifications: "Meldingen", noPosts: "Geen posts", back: "Terug", message: "Bericht", clear: "Wissen" },
        pl: { settings: "Ustawienia", editProfile: "Edytuj profil", backup: "Kopia zapasowa", delete: "Usuń konto", logout: "Wyloguj", createPost: "Utwórz wpis", post: "Opublikuj", save: "Zapisz", experience: "Doświadczenie", activity: "Aktywność", followers: "Obserwujący", following: "Obserwowani", follow: "Obserwuj", unfollow: "Obserwujesz", block: "Zablokuj", unblock: "Odblokuj", report: "Zgłoś", jobs: "Praca", search: "Szukaj", notifications: "Powiadomienia", noPosts: "Brak wpisów", back: "Wstecz", message: "Wiadomość", clear: "Wyczyść" },
        id: { settings: "Pengaturan", editProfile: "Edit Profil", backup: "Cadangkan", delete: "Hapus Akun", logout: "Keluar", createPost: "Buat Post", post: "Posting", save: "Simpan", experience: "Pengalaman", activity: "Aktivitas", followers: "Pengikut", following: "Mengikuti", follow: "Ikuti", unfollow: "Mengikuti", block: "Blokir", unblock: "Buka Blokir", report: "Lapor", jobs: "Cari Kerja", search: "Cari", notifications: "Notifikasi", noPosts: "Tidak ada post", back: "Kembali", message: "Pesan", clear: "Hapus" },
        vi: { settings: "Cài đặt", editProfile: "Sửa hồ sơ", backup: "Sao lưu", delete: "Xóa tài khoản", logout: "Đăng xuất", createPost: "Tạo bài viết", post: "Đăng", save: "Lưu", experience: "Kinh nghiệm", activity: "Hoạt động", followers: "Người theo dõi", following: "Đang theo dõi", follow: "Theo dõi", unfollow: "Đang theo dõi", block: "Chặn", unblock: "Bỏ chặn", report: "Báo cáo", jobs: "Tìm việc", search: "Tìm kiếm", notifications: "Thông báo", noPosts: "Chưa có bài", back: "Quay lại", message: "Tin nhắn", clear: "Xóa" },
        th: { settings: "การตั้งค่า", editProfile: "แก้ไขโปรไฟล์", backup: "สำรองข้อมูล", delete: "ลบบัญชี", logout: "ออก", createPost: "สร้างโพสต์", post: "โพสต์", save: "บันทึก", experience: "ประสบการณ์", activity: "กิจกรรม", followers: "ผู้ติดตาม", following: "กำลังติดตาม", follow: "ติดตาม", unfollow: "กำลังติดตาม", block: "บล็อก", unblock: "ปลดบล็อก", report: "รายงาน", jobs: "หางาน", search: "ค้นหา", notifications: "การแจ้งเตือน", noPosts: "ไม่มีโพสต์", back: "กลับ", message: "ข้อความ", clear: "ล้าง" },
        bn: { settings: "সেটিংস", editProfile: "প্রোফাইল এডিট", backup: "ব্যাকআপ", delete: "অ্যাকাউন্ট মুছুন", logout: "লগআউট", createPost: "পোস্ট করুন", post: "পোস্ট", save: "সেভ", experience: "অভিজ্ঞতা", activity: "কার্যকলাপ", followers: "ফলোয়ার", following: "ফলোইং", follow: "ফলো", unfollow: "ফলোইং", block: "ব্লক", unblock: "আনব্লক", report: "রিপোর্ট", jobs: "চাকরি", search: "খুঁজুন", notifications: "নোটিফিকেশন", noPosts: "কোনো পোস্ট নেই", back: "পেছনে", message: "মেসেজ", clear: "মুছুন" },
        pa: { settings: "ਸੈਟਿੰਗਾਂ", editProfile: "ਪ੍ਰੋਫਾਈਲ ਬਦਲੋ", backup: "ਬੈਕਅੱਪ", delete: "ਖਾਤਾ ਹਟਾਓ", logout: "ਲੌਗ ਆਉਟ", createPost: "ਪੋਸਟ ਬਣਾਓ", post: "ਪੋਸਟ", save: "ਸੰਭਾਲੋ", experience: "ਤਜਰਬਾ", activity: "ਸਰਗਰਮੀ", followers: "ਫਾਲੋਅਰਜ਼", following: "ਫਾਲੋਇੰਗ", follow: "ਫਾਲੋ", unfollow: "ਫਾਲੋਇੰਗ", block: "ਬਲੌਕ", unblock: "ਅਣਬਲੌਕ", report: "ਰਿਪੋਰਟ", jobs: "ਨੌਕਰੀ ਲੱਭੋ", search: "ਖੋਜ", notifications: "ਸੂਚਨਾਵਾਂ", noPosts: "ਕੋਈ ਪੋਸਟ ਨਹੀਂ", back: "ਵਾਪਸ", message: "ਸੁਨੇਹਾ", clear: "ਸਾਫ਼ ਕਰੋ" },
        ur: { settings: "ترتیبات", editProfile: "پروفائل تبدیل", backup: "بیک اپ", delete: "اکاؤنٹ ڈیلیٹ", logout: "لاگ آؤٹ", createPost: "پوسٹ بنائیں", post: "پوسٹ", save: "محفوظ", experience: "تجربہ", activity: "سرگرمی", followers: "فالوورز", following: "فالونگ", follow: "فالو", unfollow: "فالونگ", block: "بلاک", unblock: "ان بلاک", report: "رپورٹ", jobs: "نوکری", search: "تلاش", notifications: "اطلاعات", noPosts: "کوئی پوسٹ نہیں", back: "واپس", message: "پیغام", clear: "صاف" }
    };

    function txt(key) {
        const lang = localStorage.getItem('appLang') || 'en';
        const t = translations[lang] || translations['en'];
        return t[key] || translations['en'][key];
    }
    function applyTranslations() {
        if(document.getElementById('lbl-settings')) document.getElementById('lbl-settings').innerText = txt('settings');
        if(document.getElementById('lbl-edit-profile')) document.getElementById('lbl-edit-profile').innerText = txt('editProfile');
        if(document.getElementById('lbl-backup')) document.getElementById('lbl-backup').innerText = txt('backup');
        if(document.getElementById('lbl-delete')) document.getElementById('lbl-delete').innerText = txt('delete');
        if(document.getElementById('lbl-logout')) document.getElementById('lbl-logout').innerText = txt('logout');
        if(document.getElementById('lbl-create-post')) document.getElementById('lbl-create-post').innerText = txt('createPost');
        if(document.getElementById('lbl-btn-post')) document.getElementById('lbl-btn-post').innerText = txt('post');
        if(document.getElementById('lbl-save-changes')) document.getElementById('lbl-save-changes').innerText = txt('save');
        if(document.getElementById('lbl-edit-header')) document.getElementById('lbl-edit-header').innerText = txt('editProfile');
        document.getElementById('postContent').placeholder = txt('createPost') + "...";
    }



    function formatTimeAgo(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }

    function generateLinkHtml(url) {
        const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
        if (ytMatch && ytMatch[1]) {
            const ytId = ytMatch[1];
            return `
            <div class="w-full aspect-video rounded-xl overflow-hidden mt-2 mb-3 shadow-sm relative group bg-cover bg-center" style="background-image: url('https://img.youtube.com/vi/${ytId}/hqdefault.jpg');">
                <iframe 
                    class="youtube-iframe absolute inset-0 w-full h-full"
                    src="https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&fs=1&controls=1&disablekb=1&enablejsapi=1"
                    style="width: 100%; height: 100%; border: none;"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowfullscreen>
                </iframe>
            </div>`;
        }
        return `<button onclick="openLink('${url}')" class="w-full mt-2 mb-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-3 rounded-xl text-sm font-bold transition flex items-center justify-center shadow-lg transform hover:-translate-y-0.5"><i class="fa-solid fa-link mr-2"></i> Visit Link</button>`;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const getHeaders = (isFormData = false) => {
        const token = localStorage.getItem("token");
        const headers = { "x-auth-token": token };
        if (!isFormData) headers["Content-Type"] = "application/json";
        return headers;
    };

    function setBtnLoading(btnId, isLoading) {
        const btn = document.getElementById(btnId);
        if(!btn) return;
        if(isLoading) {
            if(!btn.dataset.origText) btn.dataset.origText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wait...';
            btn.disabled = true;
            btn.style.opacity = '0.7';
        } else {
            if(btn.dataset.origText) btn.innerHTML = btn.dataset.origText;
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }

   const APIService = {
    auth: {
        login: async () => {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPass').value;
            if(!email || !password) return showToast("Enter credentials");
            setBtnLoading('loginBtn', true);
            try {
                const res = await fetch(`${API_BASE}/api/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
                const data = await res.json();
                if(res.ok) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("userId", data.user._id);
                    localStorage.setItem("userName", data.user.name);
                    localStorage.setItem("userEmail", data.user.email);
                    if(data.user.photo) localStorage.setItem("userPhoto", data.user.photo);
                    localStorage.setItem("userCountry", data.user.country || "India");
                    myBlockedUsers = data.user.blockedUsers || [];
                    const savedToken = localStorage.getItem("fcmToken");
                    if(savedToken) APIService.user.updateFcm(savedToken);
                    checkLoginStatus();
                } else openAlertModal("Login Failed", data.error);
            } catch(e) { alert("Server connection failed. Is server.js running?"); }
            finally { setBtnLoading('loginBtn', false); }
        },
        initiateRegister: async () => {
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPass').value;
            const username = document.getElementById('regUsername').value;
            
            if(!name || !email || !password || !username) return showToast("Fill all fields");
            setBtnLoading('regOtpBtn', true);
            try {
                const res = await fetch(`${API_BASE}/api/send-otp`, { 
                    method: "POST", 
                    headers: { "Content-Type": "application/json" }, 
                    body: JSON.stringify({ email, type: 'register' }) 
                });
                const data = await res.json();
                if(res.ok) {
                    showToast("OTP Sent to Email!");
                    document.getElementById('reg-step-1').classList.add('hidden');
                    document.getElementById('reg-step-2').classList.remove('hidden');
                } else {
                    if (data.error && (data.error.includes("already registered") || data.error.includes("Exists"))) {
                        openAlertModal("Account Exists", data.error);
                        switchAuth('form-login'); 
                    } else {
                        showToast(data.error || "Failed to send OTP");
                    }
                }
            } catch(e) { showToast("Server Error"); }
            finally { setBtnLoading('regOtpBtn', false); }
        },
        completeRegister: async () => {
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPass').value;
            const username = document.getElementById('regUsername').value;
            const country = document.getElementById('regCountry').value;
            const otp = document.getElementById('regOtpInput').value;
            if(!otp) return showToast("Please enter OTP");
            setBtnLoading('regCompleteBtn', true);
            try {
                const res = await fetch(`${API_BASE}/api/register`, { 
                    method: "POST", 
                    headers: { "Content-Type": "application/json" }, 
                    body: JSON.stringify({ name, email, password, username, country, otp }) 
                });
                const data = await res.json();

                if(res.ok) {
                    openAlertModal("Success", "Account Created! Please Login.");
                    switchAuth('form-login');
                    document.getElementById('reg-step-1').classList.remove('hidden');
                    document.getElementById('reg-step-2').classList.add('hidden');
                    document.getElementById('regOtpInput').value = "";
                } else {
                    if (data.error && (data.error.includes("Exists") || data.error.includes("registered"))) {
                         openAlertModal("Registration Failed", "This Username or Email is already taken.");
                    } else {
                         openAlertModal("Registration Failed", data.error || "Error");
                    }
                }
            } catch(e) { showToast("Server Error"); }
            finally { setBtnLoading('regCompleteBtn', false); }
        },
        sendOtp: async (context, emailParam) => {
            const email = emailParam || document.getElementById('forgotEmail').value;
            const type = context || 'forgot';
            authContext = type;
            setBtnLoading('forgotOtpBtn', true);
            try {
                const res = await fetch(`${API_BASE}/api/send-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, type }) });
                if(res.ok) {
                    localStorage.setItem("tempEmail", email);
                    document.getElementById('displayEmail').innerText = email;
                    switchAuth('form-otp');
                    showToast("OTP Sent!");
                } else alert("Error sending OTP");
            } catch(e) { showToast("Server Error"); }
            finally { setBtnLoading('forgotOtpBtn', false); }
        },
        verifyOtp: async () => {
            const otp = document.getElementById('otpCode').value;
            const email = localStorage.getItem("tempEmail");
            setBtnLoading('verifyOtpBtn', true);
            try {
                const res = await fetch(`${API_BASE}/api/verify-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp }) });
                if(res.ok) {
                    showToast("Verified!");
                    if(authContext === 'forgot') {
                        switchAuth('form-reset');
                    } else {
                        switchAuth('form-login');
                        openAlertModal("Success", "Account Verified! Please Login.");
                    }
                } else showToast("Invalid OTP");
            } catch(e) { showToast("Error"); }
            finally { setBtnLoading('verifyOtpBtn', false); }
        },
        resetPassword: async () => {
            const newPassword = document.getElementById('newPassInput').value;
            const email = localStorage.getItem("tempEmail");
            setBtnLoading('resetPassBtn', true);
            try {
                const res = await fetch(`${API_BASE}/api/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, newPassword }) });
                if(res.ok) {
                    showToast("Password Updated!");
                    switchAuth('form-login');
                }
            } catch(e) { showToast("Error"); }
            finally { setBtnLoading('resetPassBtn', false); }
        },
        logout: () => { localStorage.clear(); location.reload(); }
    }, // <-- AUTH BLOCK YAHAN CLOSE HUA

    notifications: {
        getAll: async () => {
            // 🔥 Time wali trick aur API_BASE add kar diya hai (No-cache)
            const response = await fetch(`${API_BASE}/api/notifications?time=${Date.now()}`, {
                method: 'GET',
                headers: {
                    'x-auth-token': localStorage.getItem('token'),
                    'Cache-Control': 'no-cache'
                }
            });
            return await response.json();
        },
        delete: async (id) => {
            const response = await fetch(`${API_BASE}/api/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            return await response.json();
        }
    }, // <-- NOTIFICATIONS BLOCK YAHAN CLOSE HUA (Agar iske aage aur code jaise 'user: {}' hai toh yahan comma (,) laga dena)

        user: {
            getShareFreq: async () => (await fetch(`${API_BASE}/api/user/get-share-freq`, { headers: getHeaders() })).json(),
            updateShareFreq: async (targetUserId) => { await fetch(`${API_BASE}/api/user/update-share-freq`, { method: "POST", headers: getHeaders(), body: JSON.stringify({ targetUserId }) }); },
            getProfile: async (id) => (await fetch(`${API_BASE}/api/user/profile/${id}?t=${Date.now()}`)).json(),
            getFollowers: async (id) => (await fetch(`${API_BASE}/api/user/followers/${id}?t=${Date.now()}`, { headers: getHeaders() })).json(),
            getFollowing: async (id) => (await fetch(`${API_BASE}/api/user/following/${id}?t=${Date.now()}`, { headers: getHeaders() })).json(),
            follow: async (id) => (await fetch(`${API_BASE}/api/user/follow/${id}`, { method: "PUT", headers: getHeaders() })).json(),
            update: async (name, headline) => { await fetch(`${API_BASE}/api/user/update`, { method: "PUT", headers: getHeaders(), body: JSON.stringify({name, headline}) }); },
            delete: async () => { await fetch(`${API_BASE}/api/user/delete`, { method: "DELETE", headers: getHeaders() }); },
            uploadPhoto: async (file) => {
                if(!file) return;
                const fd = new FormData();
                fd.append("photo", file);
                showToast("Uploading...");
                const res = await fetch(`${API_BASE}/api/user/upload-photo`, { method: "POST", headers: { "x-auth-token": localStorage.getItem("token") }, body: fd });
                if(res.ok) {
                    showToast("Photo Updated!");
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showToast("Upload Failed");
                }
            },
            updateFcm: async (token) => {
                try {
                    await fetch(`${API_BASE}/api/user/fcm-token`, {
                        method: "PUT",
                        headers: getHeaders(),
                        body: JSON.stringify({ fcmToken: token })
                    });
                } catch(e) { console.error("FCM Sync Error", e); }
            },
            backup: async () => { const res = await fetch(`${API_BASE}/api/user/backup`, { headers: getHeaders() }); const data = await res.json(); const blob = new Blob([JSON.stringify(data)], {type:"application/json"}); const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download="backup.json"; a.click(); },
            block: async (id) => { const res = await fetch(`${API_BASE}/api/user/block/${id}`, { method: "PUT", headers: getHeaders() }); return await res.json(); },
            addExperience: async (expData) => { await fetch(`${API_BASE}/api/user/add-experience`, { method: "POST", headers: getHeaders(), body: JSON.stringify({ userId: localStorage.getItem("userId"), experienceData: expData }) }); },
            editExperience: async (id, expData) => { await fetch(`${API_BASE}/api/user/experience/${id}`, { method: "PUT", headers: getHeaders(), body: JSON.stringify(expData) }); },
            deleteExperience: async (id) => { await fetch(`${API_BASE}/api/user/experience/${id}`, { method: "DELETE", headers: getHeaders() }); },
        },
        feed: {
            create: async(fd) => fetch(`${API_BASE}/api/posts/create`, {method:"POST", headers: { "x-auth-token": localStorage.getItem("token") }, body:fd}),
            getAll: async() => {
                let url = `${API_BASE}/api/posts?t=${new Date().getTime()}`;
                if (window.preferredKeyword) {
                    url += `&preferredKeyword=${encodeURIComponent(window.preferredKeyword)}`;
                }
                const res = await fetch(url, {headers: getHeaders()});
                if(!res.ok) throw new Error("Feed Error");
                let data = await res.json();
                let deleted = JSON.parse(sessionStorage.getItem('deletedPosts') || '[]');
                data = data.filter(p => !deleted.includes(p._id));
                window.allPosts = data;
                return data;
            },
            getMyPosts: async() => {
                let data = await (await fetch(`${API_BASE}/api/my-posts`, {headers:getHeaders()})).json();
                let deleted = JSON.parse(sessionStorage.getItem('deletedPosts') || '[]');
                return data.filter(p => !deleted.includes(p._id));
            },
            like: async(id) => fetch(`${API_BASE}/api/posts/like/${id}`, {method:"PUT", headers:getHeaders()}),
            comment: async(id, text) => fetch(`${API_BASE}/api/posts/comment/${id}`, {method:"POST", headers:getHeaders(), body:JSON.stringify({text})}),
            delete: async(id) => fetch(`${API_BASE}/api/posts/${id}`, {method:"DELETE", headers:getHeaders()}),
            deleteComment: async(postId, commentId) => fetch(`${API_BASE}/api/posts/comment/${postId}/${commentId}`, { method: "DELETE", headers: getHeaders() })
        },
        chat: {
            search: async (q) => (await fetch(`${API_BASE}/api/search?q=${q}&t=${Date.now()}`, { headers: getHeaders() })).json(),
            send: async (rid, txt) => fetch(`${API_BASE}/api/messages`, { method:"POST", headers:getHeaders(), body:JSON.stringify({receiverId:rid, content:txt}) }),
            upload: async (fd) => fetch(`${API_BASE}/api/messages/upload`, { method: "POST", headers: { "x-auth-token": localStorage.getItem("token") }, body: fd }),
            getHistory: async(id) => (await fetch(`${API_BASE}/api/messages/${id}?t=${Date.now()}`, { headers: getHeaders() })).json(),
            deleteMsg: async (id) => { await fetch(`${API_BASE}/api/messages/${id}`, { method: "DELETE", headers: getHeaders() }); },
            clearChat: async (id) => { await fetch(`${API_BASE}/api/messages/clear/${id}`, { method: "DELETE", headers: getHeaders() }); },
            getConversations: async() => (await fetch(`${API_BASE}/api/chat/conversations?t=${Date.now()}`, { headers: getHeaders() })).json(),
            reactToMsg: async (id, emoji) => fetch(`${API_BASE}/api/messages/react/${id}`, { method:"PUT", headers:getHeaders(), body:JSON.stringify({ emoji }) })
        },
        notifications: {
            getAll: async () => (await fetch(`${API_BASE}/api/notifications?t=${Date.now()}`, { headers: getHeaders() })).json(),
            delete: async (id) => {
                const res = await fetch(`${API_BASE}/api/notifications/${id}`, { method: "DELETE", headers: getHeaders() });
                if (!res.ok) throw new Error("Delete failed");
                return res.json();
            }
        },
        jobs: {
            search: async (endpoint) => (await fetch(`${API_BASE}/api${endpoint}`)).json()
        }
    };

    async function downloadImage(url) {
        try {
            showToast("Saving...");
            const response = await fetch(url);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onloadend = function() {
                const base64data = reader.result;
                const link = document.createElement('a');
                link.href = base64data;
                link.download = `zobbly_${Date.now()}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            reader.readAsDataURL(blob);
        } catch (e) {
            console.error("Download failed", e);
            showToast("Error saving image");
            window.open(url, '_blank');
        }
    }

    const ptrContainer = document.getElementById('ptr-container');
    const ptrIcon = document.getElementById('ptr-icon');
    const appScreen = document.getElementById('app-screen');
    
    let ptrStartY = 0;
    let ptrEnabled = false;
    let isRefreshing = false;
appScreen.addEventListener('touchstart', (e) => {
    
    if (appScreen.classList.contains('reels-mode')) {
        ptrEnabled = false;
        return; 
    }
    
    
});

        

   
    appScreen.addEventListener('touchmove', (e) => {
        if (!ptrEnabled) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - ptrStartY;

        
        if (diff > 10) {
            const resistance = 0.4; 
            const translateVal = Math.min((diff - 10) * resistance, 120);
            
            ptrContainer.style.transform = `translateY(${translateVal - 120}px)`;
            ptrIcon.style.transform = `rotate(${translateVal}deg)`; 
        } else {
            
            ptrContainer.style.transform = `translateY(-120px)`;
            ptrIcon.style.transform = `rotate(0deg)`;
            ptrEnabled = false;
        }
    }, { passive: true });

    
    appScreen.addEventListener('touchend', async (e) => {
        if (!ptrEnabled) return;

        const currentY = e.changedTouches[0].clientY;
        const diff = currentY - ptrStartY;

        ptrContainer.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

       
        if (diff > 150) {
            isRefreshing = true;
            ptrContainer.style.transform = `translateY(20px)`;
            ptrIcon.classList.add('doll-anim');

            try {
                
                if (document.getElementById('nav-feed').classList.contains('nav-active')) {
                    await renderFeed(document.getElementById('main-content'));
                } else if (document.getElementById('nav-jobs').classList.contains('nav-active')) {
                    renderView('jobs');
                } else if (document.getElementById('nav-profile').classList.contains('nav-active')) {
                    viewUserProfile(localStorage.getItem("userId"));
                } else if (document.getElementById('nav-notifs').classList.contains('nav-active')) {
                    renderView('notifications');
                }
            } catch (err) { console.log(err); }

            setTimeout(() => {
                ptrContainer.style.transform = `translateY(-120px)`;
                ptrIcon.classList.remove('doll-anim');
                isRefreshing = false;
            }, 800);
        } else {
           
            ptrContainer.style.transform = `translateY(-120px)`;
        }
        ptrEnabled = false;
        ptrStartY = 0;
    });
 

    async function checkLoginStatus() {
        const token = localStorage.getItem("token");
        const splash = document.getElementById('splash-screen');
        if(token) {
            document.getElementById('auth-screen').classList.add('hidden-screen');
            document.getElementById('app-screen').classList.remove('hidden-screen');
            applyTranslations(); 
            await updateMyStats();
            renderView('feed');
            setInterval(checkNotifs, 10000);
            setTimeout(() => { if(splash) splash.classList.add('hidden-screen'); }, 1500);
        } else {
            document.getElementById('auth-screen').classList.remove('hidden-screen');
            document.getElementById('app-screen').classList.add('hidden-screen');
            if(splash) splash.classList.add('hidden-screen');
        }
    }

    async function updateMyStats() {
        try {
            const data = await APIService.user.getProfile(localStorage.getItem("userId"));
            myFollowing = data.user.following || [];
            if(data.user.blockedUsers) { myBlockedUsers = data.user.blockedUsers.map(u => (typeof u === 'object' && u._id) ? u._id : u); } else { myBlockedUsers = []; }
        } catch(e) { console.log("Stats update error"); }
    }

    async function checkNotifs() {
        try {
            const notifs = await APIService.notifications.getAll();
            const unread = notifs.filter(n => !n.isRead).length;
            if(unread > 0) { document.getElementById('notif-badge').classList.remove('hidden'); document.getElementById('notif-badge-static').classList.remove('hidden'); } else { document.getElementById('notif-badge').classList.add('hidden'); document.getElementById('notif-badge-static').classList.add('hidden'); }
        } catch(e){}
    }



    function switchAuth(id) { document.querySelectorAll('.auth-form').forEach(e=>e.classList.add('hidden-screen')); document.getElementById(id).classList.remove('hidden-screen'); }
    function toggleSidePanel() { document.getElementById('side-panel').classList.toggle('open'); }

    function toggleCustomDropdown(menuId, triggerBtn) {
        const menu = document.getElementById(menuId);
        if (activeDropdownId && activeDropdownId !== menuId) {
            document.getElementById(activeDropdownId).classList.remove('show');
            const prevTrigger = document.querySelector(`[onclick*="${activeDropdownId}"]`);
            if(prevTrigger) prevTrigger.classList.remove('active');
        }
        menu.classList.toggle('show');
        triggerBtn.classList.toggle('active');
        activeDropdownId = menu.classList.contains('show') ? menuId : null;
        event.stopPropagation();
    }

    function selectCustomOption(value, text, icon, type) {
        document.getElementById(type === 'lang' ? 'editLang' : 'api-source').value = value;
        const textSpan = document.getElementById(type === 'lang' ? 'lang-selected-text' : 'source-selected-text');
        let iconHtml = '';
        if(type === 'lang') iconHtml = `<img src="https://flagcdn.com/w20/${icon}.png" class="w-5 h-5 rounded-full shadow-sm">`;
        else if(type === 'source') iconHtml = `<i class="fa-solid ${icon} text-purple-500"></i>`;
        textSpan.innerHTML = `${iconHtml} ${text}`;
        const menuId = type === 'lang' ? 'lang-dropdown-menu' : 'source-dropdown-menu';
        document.querySelectorAll(`#${menuId} .dropdown-option`).forEach(el => el.classList.remove('selected'));
        event.currentTarget.classList.add('selected');
        toggleCustomDropdown(menuId, document.querySelector(`[onclick*="${menuId}"]`));
        if(type === 'source') toggleInputs(value);
    }

    document.addEventListener('click', function(e) {
        if (activeDropdownId) {
            const menu = document.getElementById(activeDropdownId);
            const trigger = document.querySelector(`[onclick*="${activeDropdownId}"]`);
            if (menu && !menu.contains(e.target) && !trigger.contains(e.target)) {
                 menu.classList.remove('show');
                 trigger.classList.remove('active');
                 activeDropdownId = null;
            }
        }
        if(!e.target.closest('#chat-theme-menu') && !e.target.closest('button[onclick="toggleChatThemeMenu()"]')) {
            document.getElementById('chat-theme-menu').classList.remove('open');
        }
    });

// 🔥 NAYA: Global Variable jo track karega ki currently exactly kya khula hai
window.currentActiveView = ''; 

function renderView(view) {
    // 1. TAAQATWAR LOCK: Button dabte hi sabse pehle state update karo
    window.currentActiveView = view;

    // 2. PURANE BACKGROUND TASKS ROK DO: Agar pehle koi chat ya feed load ho rahi thi, use cancel karo
    if (window.chatInterval) clearInterval(window.chatInterval);
    if (window.statusInterval) clearInterval(window.statusInterval);

    const body = document.body;
    const contentContainer = document.getElementById('main-content');
    const scrollContainer = document.querySelector('.main-scroll-container');

    // 3. SCREEN EKDUM SAAF KARO: Ye sabse zaroori line hai! Purana kachra hata do.
    if (contentContainer) {
        contentContainer.innerHTML = ''; 
    }
    window.scrollTo(0, 0); // Scroll ko automatically top par le aao

    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    
    body.classList.remove('theme-dark', 'theme-pink', 'theme-red', 'reels-mode', 'feed-mode');
    body.style.background = ''; 
    body.style.backgroundImage = '';
    if(contentContainer) contentContainer.style.background = '';

    if (savedTheme === 'dark') {
        body.classList.add('theme-dark');
        body.style.background = '#000000'; 
        body.style.backgroundImage = 'none';
        if(contentContainer) contentContainer.style.background = '#000000';
    } 
    else if (savedTheme === 'pink') {
        body.classList.add('theme-pink');
        body.style.background = '#ffe4e1'; 
        body.style.backgroundImage = 'none';
        if(contentContainer) contentContainer.style.background = '#ffe4e1';
    } 
    else if (savedTheme === 'red') {
        body.classList.add('theme-red');
        body.style.background = '#fff5f5'; 
        body.style.backgroundImage = 'none';
        if(contentContainer) contentContainer.style.background = '#fff5f5';
    }
    
    if (view === 'reels') {
        body.classList.add('reels-mode');
        if(scrollContainer) scrollContainer.style.padding = "0";
    } else {
        body.classList.add('feed-mode');
        if(scrollContainer) {
            scrollContainer.style.paddingTop = "65px"; 
            scrollContainer.style.paddingBottom = "100px";
        }
    }

    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('nav-active', 'text-purple-600'));
    let btnId = (view === 'notifications') ? 'nav-notifs' : `nav-${view}`;
    let activeBtn = document.getElementById(btnId);
    if(activeBtn) activeBtn.classList.add('nav-active', 'text-purple-600');

    // 4. SIRF NAYA KAAM SHURU KARO
    if(view === 'feed') renderFeed(contentContainer);
    else if(view === 'reels') renderReels(contentContainer);
    else if(view === 'jobs') renderJobs(contentContainer);
    else if(view === 'notifications') renderNotifications(contentContainer);
    else if(view === 'chat') renderChat(contentContainer);
    else if(view === 'profile') viewUserProfile(localStorage.getItem("userId"));
}
   async function startChat(id, name, photo) {
        activeChatUser = id;
        document.getElementById('fc-user-name').innerText = name;
        document.getElementById('fc-user-img').src = photo || 'https://placehold.co/30';

        if(statusInterval) clearInterval(statusInterval);

        const updateStatus = async () => {
             try {
                const data = await APIService.user.getProfile(id);
                const lastActive = new Date(data.user.lastActive || Date.now());
                const now = new Date();
                const diffMins = (now - lastActive) / 1000 / 60;
                const statusEl = document.getElementById('fc-user-status');

                if(diffMins < 5) { 
                    statusEl.innerHTML = `<span class="w-2 h-2 bg-green-500 rounded-full inline-block mr-1"></span>Online`;
                    statusEl.className = "text-[10px] text-green-600 font-bold flex items-center";
                } else {
                    const timeStr = lastActive.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', day: 'numeric', month:'short'});
                    statusEl.innerText = `Last seen: ${timeStr}`;
                    statusEl.className = "text-[10px] text-gray-500 font-medium";
                }
            } catch(e) { console.log(e); }
        };

        updateStatus();
        statusInterval = setInterval(updateStatus, 2000);

        
        const themeMenu = document.getElementById('chat-theme-menu');
        themeMenu.innerHTML = chatThemes.map(t =>
            `<div class="theme-item" onclick="setChatTheme('${t.id}')">
                <div class="theme-preview" style="background: ${t.bg}"></div>
                <span class="text-sm font-medium text-gray-700">${t.name}</span>
            </div>`
        ).join('');

        loadMsgs();

        document.getElementById('full-chat-view').classList.add('active');
        isChatOpen = true; 

        if(window.chatInterval) clearInterval(window.chatInterval);
        window.chatInterval = setInterval(loadMsgs, 3000);
    }

    function closeFullChat() {
        document.getElementById('full-chat-view').classList.remove('active');
        isChatOpen = false; 
        if(window.chatInterval) clearInterval(window.chatInterval);
        if(statusInterval) clearInterval(statusInterval);
    }

    function toggleChatThemeMenu() {
        document.getElementById('chat-theme-menu').classList.toggle('open');
    }

    function setChatTheme(themeId) {
        currentTheme = chatThemes.find(t => t.id === themeId) || chatThemes[0];
        localStorage.setItem('savedChatThemeId', currentTheme.id);
        document.getElementById('chat-theme-menu').classList.remove('open');

        
        const container = document.getElementById('fc-messages');
        container.style.background = currentTheme.bg;
        container.style.backgroundSize = "cover";

        
        const header = document.getElementById('fc-header');
        const footer = document.getElementById('fc-footer');
        if(header && footer && currentTheme.barColor) {
            header.style.backgroundColor = currentTheme.barColor;
            footer.style.backgroundColor = currentTheme.barColor;
        }

        loadMsgs(); 
        const btn = document.getElementById('fc-send-btn');
        btn.className = `w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-105 transition ${currentTheme.btn || 'bg-purple-600'}`;
    }

    async function loadMsgs() {
        if(!activeChatUser) return;
        const msgs = await APIService.chat.getHistory(activeChatUser);
        const myId = localStorage.getItem("userId");
        document.getElementById('fc-messages').innerHTML = msgs.map(m => {
            let content = m.content;
            if(m.type==='image') { content = `<div class="relative inline-block"><img src="${m.fileUrl}" class="max-w-[200px] rounded-lg border shadow-sm"><button onclick="downloadImage('${m.fileUrl}')" class="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] p-1.5 rounded-full hover:bg-black/70"><i class="fa-solid fa-download"></i></button></div>`; }
            if(m.type==='video') content = `<video src="${m.fileUrl}" controls class="max-w-[200px] rounded-lg shadow-sm"></video>`;

            const isMe = m.senderId === myId;
            const bubbleClass = isMe
                ? `chat-bubble-user ${currentTheme.btn || 'bg-purple-600'} text-white self-end`
                : 'chat-bubble-other self-start bg-white/90 backdrop-blur-sm';
            const alignClass = isMe ? 'justify-end' : 'justify-start';
            const date = m.createdAt ? new Date(m.createdAt) : new Date();
            const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const dateStr = date.toLocaleDateString([], {day: 'numeric', month: 'short'}); // e.g. 24 Nov
            const fullTime = `${dateStr}, ${timeStr}`;
            return `
            <div class="flex ${alignClass} mb-2 group">
                ${isMe ? `<button onclick="deleteSingleMsg('${m._id}')" class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition text-[10px] mr-2"><i class="fa-solid fa-trash"></i></button>` : ''}
                <div class="${bubbleClass} px-4 py-2 text-sm max-w-[80%] shadow-md">
                    ${content}
                    <div class="text-[9px] opacity-70 text-right mt-1 font-mono">${fullTime}</div>
                </div>
            </div>`;
        }).join('');

        const chatMsgs = document.getElementById('fc-messages');
        chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }

    async function sendMsg() {
        const input = document.getElementById('fc-input');
        const txt = input.value;
        if(!txt) return;

       
        input.value = "";
        input.focus();

        await APIService.chat.send(activeChatUser, txt);
        loadMsgs();
        input.focus();
    }

    async function uploadChatFile(file) {
        const fd = new FormData();
        fd.append("chatFile", file);
        fd.append("receiverId", activeChatUser);
        await APIService.chat.upload(fd);
        loadMsgs();
    }

    async function clearChat() {
        openConfirmModal("Clear Chat?", "Are you sure you want to clear all messages?", async () => {
            await APIService.chat.clearChat(activeChatUser);
            loadMsgs();
        });
    }

    async function deleteSingleMsg(id) {
        openConfirmModal("Delete Message?", "Delete this message?", async () => {
            await APIService.chat.deleteMsg(id);
            loadMsgs();
        });
    }

    async function viewSinglePost(postId) {
    const c = document.getElementById('main-content');
    c.innerHTML = '<div class="text-center mt-20"><i class="fa-solid fa-spinner fa-spin text-4xl text-purple-600"></i></div>';
    try {
        const posts = await APIService.feed.getAll();
        const p = posts.find(item => item._id === postId);
        const myId = localStorage.getItem("userId");

        if (p) {
            let html = `<div class="glass-card p-3 mb-4 flex items-center gap-2 fixed top-15 left-0 right-0 mx-auto max-w-md z-30 w-full border-t border-gray-100" style="backdrop-filter: blur(20px);">
                            <button onclick="renderView('feed')" class="text-sm text-gray-600 hover:text-black bg-gray-100 px-3 py-1.5 rounded-full shadow-sm transition"><i class="fa-solid fa-arrow-left mr-1"></i> ${txt('back')}</button>
                            <h2 class="font-bold text-lg ml-2">${txt('post')}</h2>
                        </div>
                        <div style="height: 60px;"></div>`;
            
            const liked = p.likes.includes(myId);
            const isMe = p.userId?._id === myId;
            let displayContent = p.content || '';
            let linkHtml = '';
            if (p.link) {
                 displayContent = displayContent.replace(p.link, '').trim();
                 linkHtml = generateLinkHtml(p.link);
            } else {
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                const detectedLinks = displayContent.match(urlRegex);
                if(detectedLinks && detectedLinks.length > 0) {
                      const firstLink = detectedLinks[0];
                      displayContent = displayContent.replace(firstLink, '').trim();
                      linkHtml = generateLinkHtml(firstLink);
                }
            }

            const isLongText = displayContent.length > 200 || (displayContent.match(/\n/g) || []).length > 4;
            const contentId = `post-content-${p._id}`;

            const mediaUrl = p.video || p.image;
            const isVideo = p.video || (p.image && p.image.match(/\.(mp4|mov|webm)$/i));
            let mediaHtml = '';
            
            if (p.images && p.images.length > 0) {
                if (p.images.length === 1) {
                    mediaHtml = `<img src="${p.images[0]}" class="w-full rounded-xl mb-3 object-cover max-h-96 shadow-sm mt-2">`;
                } else {
                    mediaHtml = `
                    <div class="relative w-full rounded-xl mb-3 mt-2 overflow-hidden shadow-sm">
                        <div class="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide hide-scroll-bar" onscroll="updateDots(this, '${p._id}')" style="scrollbar-width: none; -ms-overflow-style: none;">
                            ${p.images.map((imgUrl, idx) => `
                                <div class="w-full flex-shrink-0 snap-center relative">
                                    <img src="${imgUrl}" class="w-full object-cover max-h-96">
                                </div>
                            `).join('')}
                        </div>
                        <div id="dots-${p._id}" class="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                            ${p.images.map((_, idx) => `<div class="w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-white' : 'bg-white/50'} shadow-sm transition-colors"></div>`).join('')}
                        </div>
                    </div><style>.hide-scroll-bar::-webkit-scrollbar { display: none; }</style>`;
                }
            } else if (mediaUrl) {
                if (isVideo) {
                    mediaHtml = `<video src="${mediaUrl}" controls playsinline class="w-full rounded-xl mb-3 object-cover max-h-96 shadow-sm mt-2 bg-black"></video>`;
                } else {
                    mediaHtml = `<img src="${mediaUrl}" class="w-full rounded-xl mb-3 object-cover max-h-96 shadow-sm mt-2">`;
                }
            }

            const userName = p.userId?.name || "Deleted User";
            const userPhoto = p.userId?.photo || "https://placehold.co/50";
            const userHandle = p.userId?.username ? `@${p.userId.username}` : '';
            const userCountry = p.userId?.country ? `<span class="ml-1 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500"><i class="fa-solid fa-earth-americas"></i> ${p.userId.country}</span>` : '';
            const userId = p.userId?._id || '';

            html += `<div class="glass-card mb-4 p-4 relative">
                        <div class="flex justify-between items-start mb-3">
                            <div class="flex items-center gap-3">
                                <img src="${userPhoto}" class="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer" onclick="${userId ? `viewUserProfile('${userId}')` : ''}">
                                <div>
                                    <h3 class="font-bold text-gray-800 text-sm cursor-pointer hover:underline flex items-center gap-1" onclick="${userId ? `viewUserProfile('${userId}')` : ''}">
                                        ${userName}
                                        <span class="text-xs text-gray-400 font-normal hidden sm:inline">${userHandle}</span>
                                        ${userCountry}
                                    </h3>
                                    <div class="flex items-center gap-1.5">
                                        <p class="text-[10px] text-gray-500">${p.userId?.headline || 'Member'}</p>
                                        <span class="text-[8px] text-gray-300">•</span>
                                        <p class="text-[10px] text-gray-400 font-medium">${formatTimeAgo(p.createdAt || new Date())}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="${contentId}" class="text-gray-800 mb-2 text-sm whitespace-pre-line break-words ${isLongText ? 'line-clamp-custom' : ''}">${displayContent}</div>
                        ${isLongText ? `<button onclick="toggleSeeMore('${contentId}', this)" class="text-purple-600 text-xs font-bold mb-2 hover:underline">See more...</button>` : ''}
                        
                        ${mediaHtml}
                        ${linkHtml}
                        
                        <div class="flex items-center gap-6 border-t border-gray-200/50 pt-3">
                            <button onclick="toggleLike('${p._id}')" class="flex items-center gap-2 text-sm text-gray-600">
                                <i class="fa-solid fa-heart ${liked?'text-red-500 font-bold':'text-gray-500'}" id="like-icon-${p._id}"></i>
                                <span id="like-cnt-${p._id}">${p.likes.length}</span>
                            </button>
                            <button onclick="toggleComment('${p._id}')" class="flex items-center gap-2 text-gray-500 text-sm">
                                <i class="fa-solid fa-comment"></i>
                                <span id="cmt-cnt-${p._id}">${p.comments.length}</span>
                            </button>
                        </div>
                        <div id="comments-${p._id}" class="mt-3 pt-3 border-t border-gray-200/50">
                            <div class="max-h-64 overflow-y-auto mb-2 space-y-3 px-1" id="cmt-list-${p._id}">
                                ${p.comments.map(cm => {
                                    const canDelete = isMe || (cm.userId && cm.userId._id === myId);
                                    return `
                                    <div class="flex gap-2 items-start group" id="comment-item-${cm._id}">
                                        <img src="${cm.userId?.photo || 'https://placehold.co/30'}" class="w-8 h-8 rounded-full border border-gray-200 mt-1 object-cover cursor-pointer" onclick="${cm.userId ? `viewUserProfile('${cm.userId._id}')` : ''}">
                                        <div class="bg-gray-100 p-2.5 rounded-2xl rounded-tl-none relative w-full max-w-[85%]">
                                            <div class="flex justify-between items-center mb-0.5">
                                                <span class="font-bold text-xs text-gray-900 cursor-pointer hover:underline" onclick="${cm.userId ? `viewUserProfile('${cm.userId._id}')` : ''}">${cm.userName}</span>
                                                ${canDelete ? `<button onclick="deleteComment('${p._id}', '${cm._id}')" class="text-gray-400 hover:text-red-500 text-[10px]"><i class="fa-solid fa-trash"></i></button>` : ''}
                                            </div>
                                            <p class="text-xs text-gray-700 leading-snug">${cm.text}</p>
                                        </div>
                                    </div>
                                `}).join('')}
                            </div>
                             <div class="flex gap-2 items-center bg-gray-50 p-1.5 rounded-full border">
                                <input id="inp-${p._id}" type="text" class="w-full p-2 text-sm bg-transparent outline-none" placeholder="Write a comment...">
                                <button onclick="postComment('${p._id}')" class="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-purple-700 transition">
                                    <i class="fa-solid fa-paper-plane text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </div>`;
            c.innerHTML = html;
            applyTranslations();
        } else {
            c.innerHTML = '<div class="text-center text-gray-500 mt-10">Post not found or deleted. <br><button onclick="renderView(\'feed\')" class="mt-4 text-purple-600 font-bold">Go to Feed</button></div>';
        }
    } catch(e) { console.error(e); c.innerHTML = '<div class="text-center text-red-500 mt-10">Error loading post.</div>'; }
}

    function handleNotifClick(type, relatedId, actorId) {
        if(type === 'message') {
            if(actorId) {
                APIService.user.getProfile(actorId).then(data => {
                    startChat(actorId, data.user.name, data.user.photo);
                }).catch(() => renderView('chat'));
            } else { renderView('chat'); }
        }
        else if(type === 'follow') { viewUserProfile(actorId); }
        else if(type === 'like' || type === 'comment' || type === 'post') { viewSinglePost(relatedId); }
        else { renderView('feed'); }
    }

    async function deleteComment(postId, commentId) {
        openConfirmModal("Delete Comment?", "Are you sure you want to delete this comment?", async () => {
            const commentEl = document.getElementById(`comment-item-${commentId}`);
            if (commentEl) commentEl.remove();
            const countSpan = document.getElementById(`cmt-cnt-${postId}`);
            if (countSpan) { let current = parseInt(countSpan.innerText); countSpan.innerText = Math.max(0, current - 1); }
            try { await APIService.feed.deleteComment(postId, commentId); showToast("Comment Deleted"); } catch(e) { showToast("Error deleting comment"); }
        });
    }


async function renderFeed(c) {
    const topBar = `<div id="feed-top-bar" class="glass-card p-3 mb-4 flex gap-2 items-center fixed top-[56px] left-0 right-0 mx-auto max-w-md z-30 w-full border-t border-gray-100 transition-transform duration-300" style="backdrop-filter: blur(20px);">
                        <button onclick="document.getElementById('postModal').classList.remove('hidden')" class="w-10 h-10 bg-gradient-to-r from-purple-50 to-pink-500 rounded-full flex-shrink-0 flex items-center justify-center text-white shadow-md active:scale-95 transition"><i class="fa-solid fa-pen-nib"></i></button>
                        <div class="flex-1 relative">
                            <input id="feedSearchInput" type="text" placeholder="${txt('search')}..." class="w-full bg-white/50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition" onkeypress="handleEnterSearch(event)">
                        </div>
                        <button onclick="searchUsersFromFeed()" class="w-10 h-10 bg-gray-100 text-purple-600 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm hover:bg-purple-100 transition"><i class="fa-solid fa-magnifying-glass"></i></button>
                    </div>
                    <div style="height: 80px;"></div>`;
                    
    // 🔥 LOADER TEXT CHANGED TO ENGLISH
    c.innerHTML = topBar + `
        <div id="feed-loader" class="flex flex-col justify-center items-center py-16 w-full">
            <lottie-player 
                src="https://aakash7911.github.io/cat_animation.json/" 
                background="transparent" 
                speed="1" 
                style="width: 150px; height: 150px;" 
                loop 
                autoplay>
            </lottie-player>
            <p class="text-sm text-gray-400 font-medium mt-2 animate-pulse">Loading your feed...</p>
        </div>
    `;

    try {
        let posts = await APIService.feed.getAll();
        
        // Data aate hi loader ko hata do
        const loader = document.getElementById('feed-loader');
        if (loader) loader.remove();

        const myId = localStorage.getItem("userId");
        const myCountry = localStorage.getItem("userCountry") || "India";
        const safeBlockedList = (myBlockedUsers || []).map(u => (typeof u === 'object' && u._id) ? u._id : u);

        if(posts && posts.length > 0) {
            
            let feedOnlyPosts = posts.filter(p => p.category !== 'reel' && p.category !== 'youtube_reel');

            let preferredCategories = [];
            try {
                preferredCategories = JSON.parse(localStorage.getItem('preferredCategories')) || [];
            } catch(e){}

            let validPosts = feedOnlyPosts.filter(p => { if(!p.userId) return false; const pUserId = p.userId._id || p.userId; return !safeBlockedList.includes(pUserId); });
            
            validPosts.forEach(p => {
                p.matchScore = 0;
                if (preferredCategories.length > 0 && p.content) {
                    let contentLower = p.content.toLowerCase();
                    preferredCategories.forEach(cat => {
                        if (contentLower.includes(cat)) {
                            p.matchScore++;
                        }
                    });
                }
            });

            let localPosts = validPosts.filter(p => p.userId.country === myCountry);
            let globalPosts = validPosts.filter(p => p.userId.country !== myCountry);
            
            localPosts = shuffleArray(localPosts);
            globalPosts = shuffleArray(globalPosts);
            
            localPosts.sort((a,b) => b.matchScore - a.matchScore);
            globalPosts.sort((a,b) => b.matchScore - a.matchScore);

            let mixedPosts = [...localPosts, ...globalPosts];

            if (mixedPosts.length === 0) {
                 c.innerHTML += `<div class="text-center text-gray-500 mt-10"><p>${txt('noPosts')}</p></div>`;
            } else {
                c.innerHTML += mixedPosts.map(p => {
                    const userName = p.userId.name;
                    const userPhoto = p.userId.photo || "https://placehold.co/50";
                    const userId = p.userId._id;
                    const userUsername = p.userId.username || '';
                    const liked = p.likes.includes(myId);
                    const isMe = userId === myId;
                    const isFollowing = myFollowing.includes(userId);
                    let displayContent = p.content || '';
                    let linkHtml = '';
                   
                    if (p.link) {
                         displayContent = displayContent.replace(p.link, '').trim();
                         linkHtml = generateLinkHtml(p.link);
                    } else {
                        const urlRegex = /(https?:\/\/[^\s]+)/g;
                        const detectedLinks = displayContent.match(urlRegex);
                        if(detectedLinks && detectedLinks.length > 0) {
                              const firstLink = detectedLinks[0];
                              displayContent = displayContent.replace(firstLink, '').trim();
                              linkHtml = generateLinkHtml(firstLink);
                        }
                    }

                    const isLongText = displayContent.length > 200 || (displayContent.match(/\n/g) || []).length > 4;
                    const contentId = `post-content-${p._id}`;
                
                    const userHandle = p.userId.username ? `@${p.userId.username}` : '';
                    const userCountry = p.userId.country ? `<span class="ml-1 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500"><i class="fa-solid fa-earth-americas"></i> ${p.userId.country}</span>` : '';
                    const mediaUrl = p.video || p.image;
                    const isVideo = p.video || (p.image && p.image.match(/\.(mp4|mov|webm)$/i));
                    let mediaHtml = '';
                    
                    if (p.images && p.images.length > 0) {
                        if (p.images.length === 1) {
                            mediaHtml = `<img src="${p.images[0]}" class="w-full rounded-xl mb-3 object-cover max-h-80 shadow-sm mt-2">`;
                        } else {
                            mediaHtml = `
                            <div class="relative w-full rounded-xl mb-3 mt-2 overflow-hidden shadow-sm">
                                <div class="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide hide-scroll-bar" onscroll="updateDots(this, '${p._id}')" style="scrollbar-width: none; -ms-overflow-style: none;">
                                    ${p.images.map((imgUrl, idx) => `
                                        <div class="w-full flex-shrink-0 snap-center relative">
                                            <img src="${imgUrl}" class="w-full object-cover max-h-80">
                                        </div>
                                    `).join('')}
                                </div>
                                <div id="dots-${p._id}" class="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                                    ${p.images.map((_, idx) => `<div class="w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-white' : 'bg-white/50'} shadow-sm transition-colors"></div>`).join('')}
                                </div>
                            </div><style>.hide-scroll-bar::-webkit-scrollbar { display: none; }</style>`;
                        }
                    } else if (mediaUrl) {
                        if (isVideo) {
                            mediaHtml = `<video src="${mediaUrl}" controls playsinline class="w-full rounded-xl mb-3 object-cover max-h-80 shadow-sm mt-2 bg-black"></video>`;
                        } else {
                            mediaHtml = `<img src="${mediaUrl}" class="w-full rounded-xl mb-3 object-cover max-h-80 shadow-sm mt-2">`;
                        }
                    }
                    
                     return `<div id="post-container-${p._id}" data-userid="${userId}" data-post-id="${p._id}" class="post-container glass-card mb-4 p-4 relative transition-all duration-300">
                        <div class="flex justify-between items-start mb-3">
                            <div class="flex items-center gap-3">
                                <img src="${userPhoto}" class="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer" onclick="viewUserProfile('${userId}')">
                                <div>
                                    <h3 class="font-bold text-gray-800 text-sm cursor-pointer hover:underline flex items-center gap-1" onclick="viewUserProfile('${userId}')">
                                        ${userName}
                                        <span class="text-xs text-gray-400 font-normal hidden sm:inline">${userHandle}</span>
                                        ${userCountry}
                                    </h3>
                                    <div class="flex items-center gap-1.5">
                                        <p class="text-[10px] text-gray-500">${p.userId.headline || 'Member'}</p>
                                        <span class="text-[8px] text-gray-300">•</span>
                                        <p class="text-[10px] text-gray-400 font-medium">${formatTimeAgo(p.createdAt || new Date())}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                ${!isMe ? `<button onclick="toggleFollow('${userId}', this)" class="btn-follow ${isFollowing ? 'btn-following' : 'btn-not-following'}">${isFollowing ? txt('unfollow') : txt('follow')}</button>` : ''}
                                <div class="relative">
                                    <button onclick="document.getElementById('post-menu-${p._id}').classList.toggle('hidden')" class="text-gray-500 hover:text-black p-2"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                                    <div id="post-menu-${p._id}" class="hidden dropdown-menu absolute right-0 top-8 bg-white shadow-xl rounded-lg w-32 z-10 overflow-hidden border">
                                        ${isMe ? `<button onclick="deletePost('${p._id}')" class="w-full text-left p-2 text-sm text-red-600 hover:bg-red-50"><i class="fa-solid fa-trash mr-2"></i>Delete</button>`
                                            : `<button onclick="reportUser('${userId}', '${userUsername}')" class="w-full text-left p-2 text-sm hover:bg-gray-100"><i class="fa-solid fa-flag mr-2"></i>${txt('report')}</button>
                                               <button onclick="blockUser('${userId}', '${userUsername}')" class="w-full text-left p-2 text-sm text-red-600 hover:bg-red-50"><i class="fa-solid fa-ban mr-2"></i>${txt('block')}</button>`}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="${contentId}" class="text-gray-800 mb-2 text-sm whitespace-pre-line break-words ${isLongText ? 'line-clamp-custom' : ''}">${displayContent}</div>
                        ${isLongText ? `<button onclick="toggleSeeMore('${contentId}', this)" class="text-purple-600 text-xs font-bold mb-2 hover:underline">See more...</button>` : ''}
                        
                        ${mediaHtml} 
                        ${linkHtml}

                        <div class="flex items-center gap-6 border-t border-gray-200/50 pt-3">
                            <button onclick="toggleLike('${p._id}')" class="flex items-center gap-2 text-sm text-gray-600">
                                <i class="fa-solid fa-heart ${liked?'text-red-500 font-bold':'text-gray-500'}" id="like-icon-${p._id}"></i>
                                <span id="like-cnt-${p._id}">${p.likes.length}</span>
                            </button>
                            <button onclick="toggleComment('${p._id}')" class="flex items-center gap-2 text-gray-500 text-sm">
                                <i class="fa-solid fa-comment"></i>
                                <span id="cmt-cnt-${p._id}">${p.comments.length}</span>
                            </button>
                            <span class="text-[10px] text-gray-400 ml-auto">${new Date(p.createdAt || new Date()).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div id="comments-${p._id}" class="hidden mt-3 pt-3 border-t border-gray-200/50">
                            <div class="max-h-48 overflow-y-auto mb-2 space-y-3 px-1" id="cmt-list-${p._id}">
                               ${p.comments.map(cm => {
    
                               const myId = localStorage.getItem("userId");
                               const isPostOwner = p.userId && (p.userId._id === myId || p.userId === myId);
                               const isCommentOwner = cm.userId && (cm.userId._id === myId || cm.userId === myId);
                               const canDelete = isPostOwner || isCommentOwner;

                               return `
                                 <div class="flex gap-3 text-xs group" id="comment-item-${cm._id}">
                                    <img src="${cm.userId?.photo || 'https://placehold.co/20'}" class="w-8 h-8 rounded-full object-cover">
                                        <div class="flex-1 bg-gray-50 p-2 rounded-lg relative">
                                             <div class="flex justify-between items-center mb-1">
                                          <span class="font-bold">${cm.userName || 'User'}</span>
                
                                  ${canDelete ? `<button onclick="deleteComment('${p._id}', '${cm._id}')" class="text-red-400 hover:text-red-600 transition p-1"><i class="fa-solid fa-trash"></i></button>` : ''}
            
                                      </div>
                                   <p class="text-gray-600">${cm.text}</p>
                                  </div>
                                </div>`;
                             }).join('')}
                            </div>
                            <div class="flex gap-2 items-center bg-gray-50 p-1.5 rounded-full border">
                                <input id="inp-${p._id}" type="text" class="w-full p-2 text-sm bg-transparent outline-none" placeholder="Write a comment...">
                                <button onclick="postComment('${p._id}')" class="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-purple-700 transition">
                                    <i class="fa-solid fa-paper-plane text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </div>`;
                }).join('');
                c.innerHTML += `<div class="h-24 w-full"></div>`;
            }
        } else { c.innerHTML += `<div class="text-center text-gray-500 mt-10"><p>${txt('noPosts')}</p></div>`; }
    } catch(e) { 
        const errLoader = document.getElementById('feed-loader');
        if (errLoader) errLoader.remove();
        c.innerHTML += '<p class="text-center text-red-500 text-sm mt-4">Error loading feed.</p>'; 
    }
    observeFeedVideos();
    applyTranslations();
}

let feedObserver = null;
function observeFeedVideos() {
    if (feedObserver) feedObserver.disconnect();
    feedObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const iframe = entry.target.querySelector('.youtube-iframe');
            const v = entry.target.querySelector('video');

            if (entry.isIntersecting) {
                // Pause other videos
                document.querySelectorAll('#main-content video').forEach(vid => {
                    if (vid !== v) vid.pause();
                });
                document.querySelectorAll('#main-content .youtube-iframe').forEach(ifr => {
                    if (ifr !== iframe && ifr.getAttribute('src')) {
                        ifr.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'pauseVideo', args: []}), '*');
                    }
                });

                // Track Watch Time (Generic function for both video and iframe)
                const startWatchTracking = (element) => {
                    if (!element.watchTimer) {
                        element.watchSeconds = 0;
                        element.watchTimer = setInterval(() => {
                            element.watchSeconds++;
                            if (element.watchSeconds >= 60 && !element.tracked) {
                                element.tracked = true;
                                trackCategoryFromPost(entry.target.getAttribute('data-post-id'));
                            }
                        }, 1000);
                    }
                };

                if (v) {
                    v.muted = true;
                    v.play().catch(e => console.log('Autoplay prevented:', e));
                    startWatchTracking(v);
                }
                if (iframe && iframe.getAttribute('src')) {
                    iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'playVideo', args: []}), '*');
                    iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'unMute', args: []}), '*');
                    startWatchTracking(iframe);
                }
            } else {
                if (v) {
                    v.pause();
                    if (v.watchTimer) { clearInterval(v.watchTimer); v.watchTimer = null; }
                }
                if (iframe && iframe.getAttribute('src')) {
                    iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'pauseVideo', args: []}), '*');
                    if (iframe.watchTimer) { clearInterval(iframe.watchTimer); iframe.watchTimer = null; }
                }
            }
        });
    }, { threshold: 0.6 });

    document.querySelectorAll('#main-content .post-container').forEach(post => {
        feedObserver.observe(post);
    });
}

function trackCategoryFromPost(postId) {
    const postEl = document.getElementById(`post-content-${postId}`);
    if (postEl) {
        let text = postEl.innerText || "";
        text = text.replace(/https?:\/\/[^\s]+/g, '').replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase();
        let words = text.split(/\s+/).filter(w => w.length > 3);
        if (words.length > 0) {
            let preferred = [];
            try { preferred = JSON.parse(localStorage.getItem('preferredCategories')) || []; } catch(e){}
            words.forEach(w => {
                if (!preferred.includes(w)) preferred.push(w);
            });
            if (preferred.length > 50) preferred = preferred.slice(preferred.length - 50);
            localStorage.setItem('preferredCategories', JSON.stringify(preferred));
            console.log("Tracked watch time for post:", postId, "Added categories:", words);
        }
    }
}
    
    function toggleSeeMore(elementId, btn) {
        const el = document.getElementById(elementId);
        if(el.classList.contains('line-clamp-custom')) { el.classList.remove('line-clamp-custom'); btn.innerText = "Show less"; } else { el.classList.add('line-clamp-custom'); btn.innerText = "See more..."; }
    }

    async function searchUsersFromFeed() {
        const query = document.getElementById('feedSearchInput').value;
        if(!query) return renderView('feed');
        const c = document.getElementById('main-content');
        c.innerHTML = '<div class="text-center mt-10"><i class="fa-solid fa-spinner fa-spin text-2xl text-purple-600"></i></div>';
        try {
            let users = await APIService.chat.search(query);
            const myId = localStorage.getItem("userId");
            users = users.filter(u => u._id !== myId);
            
            let html = `<div class="flex items-center gap-2 mb-4"><button onclick="renderView('feed')" class="text-sm text-gray-500 hover:text-black bg-white/50 px-3 py-1 rounded-full shadow-sm"><i class="fa-solid fa-arrow-left"></i> Back</button><h2 class="font-bold text-lg">Search Results</h2></div>`;
            if(users.length === 0) { html += '<div class="text-center text-gray-500 mt-10 glass-card p-4">No users found with that name.</div>'; } else {
                html += users.map(u => `
                    <div class="glass-card p-3 mb-3 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition" onclick="viewUserProfile('${u._id}')">
                        <div class="flex items-center gap-3">
                            <img src="${u.photo||'https://placehold.co/40'}" class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm">
                            <div><h3 class="font-bold text-sm text-gray-800">${u.name}</h3><p class="text-xs text-gray-500">${u.headline||'Member'}</p></div>
                        </div>
                        <i class="fa-solid fa-chevron-right text-gray-400"></i>
                    </div>`).join('');
            }
            c.innerHTML = html;
        } catch(e) { console.error(e); renderView('feed'); showToast("Search failed"); }
    }

    function handleEnterSearch(e) { if(e.key === 'Enter') searchUsersFromFeed(); }

    function openLink(url) {
        if (!url.startsWith('http')) url = 'https://' + url;
        document.getElementById('modalContent').innerHTML = `<div class="flex flex-col h-[80vh]"><div class="flex justify-between items-center mb-2 px-1 border-b pb-2"><div class="flex flex-col w-3/4"><h3 class="font-bold text-sm truncate text-gray-800">Browser View</h3><span class="text-[10px] text-gray-400 truncate">${url}</span></div><a href="${url}" target="_blank" class="bg-black text-white px-3 py-1.5 rounded-full text-[10px] font-bold transition hover:bg-gray-800">External <i class="fa-solid fa-arrow-up-right-from-square ml-1"></i></a></div><div class="flex-1 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 relative"><p class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 text-xs text-center z-0"><i class="fa-solid fa-circle-notch fa-spin mb-2 text-xl"></i><br>Loading...</p><iframe src="${url}" class="w-full h-full relative z-10 bg-white" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals allow-popups-to-escape-sandbox allow-top-navigation" onerror="this.style.display='none';"></iframe></div></div>`;
        document.getElementById('genericModal').classList.remove('hidden');
    }

    // --- CROPPER LOGIC START ---
    let cropperInstance = null;
    let selectedImages = []; // raw files
    let croppedBlobs = []; // final blobs to upload
    let currentCropIndex = 0;

    function handleMultiImageSelect(input) {
        if (!input.files || input.files.length === 0) return;
        const maxImages = 10;
        const files = Array.from(input.files).slice(0, maxImages);
        
        let hasVideo = false;
        for (let f of files) {
            if (f.type.startsWith('video/')) hasVideo = true;
        }

        if (hasVideo) {
            selectedImages = files;
            croppedBlobs = [...files];
            document.getElementById('postImageName').innerText = `${files.length} Media Ready`;
            showToast("Media selected. Video detected, cropper bypassed.");
            return;
        }

        selectedImages = files;
        croppedBlobs = new Array(files.length).fill(null);
        currentCropIndex = 0;
        
        document.getElementById('cropperModal').classList.remove('hidden');
        renderCropperThumbnails();
        loadCropperForIndex(currentCropIndex);
    }

    function renderCropperThumbnails() {
        const container = document.getElementById('cropperThumbnails');
        container.innerHTML = selectedImages.map((file, i) => {
            const url = URL.createObjectURL(file);
            const opacity = i === currentCropIndex ? '1' : '0.4';
            const borderColor = i === currentCropIndex ? '#3b82f6' : 'transparent';
            return `<div onclick="switchCropIndex(${i})" class="w-16 h-16 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 transition-all" style="opacity: ${opacity}; border-color: ${borderColor};">
                <img src="${url}" class="w-full h-full object-cover">
            </div>`;
        }).join('');
    }

    function switchCropIndex(index) {
        if (cropperInstance) {
            cropperInstance.getCroppedCanvas({ width: 1080, height: 1080 }).toBlob((blob) => {
                croppedBlobs[currentCropIndex] = blob;
                currentCropIndex = index;
                renderCropperThumbnails();
                loadCropperForIndex(currentCropIndex);
            }, 'image/jpeg', 0.85);
        }
    }

    function loadCropperForIndex(index) {
        document.getElementById('cropperStatus').innerText = `${index + 1} of ${selectedImages.length}`;
        const imgEl = document.getElementById('cropperImage');
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        
        imgEl.onload = () => {
            if(cropperInstance) cropperInstance.destroy(); // just in case
            cropperInstance = new Cropper(imgEl, {
                aspectRatio: 1, // Instagram square
                viewMode: 1,
                dragMode: 'move',
                background: false,
                autoCropArea: 1,
                cropBoxMovable: false,
                cropBoxResizable: false,
                guides: true,
                center: true
            });
        };
        // Set src after onload is bound
        imgEl.src = URL.createObjectURL(selectedImages[index]);
    }

    function cancelCropping() {
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        document.getElementById('cropperModal').classList.add('hidden');
        document.getElementById('postImage').value = ""; 
        selectedImages = [];
        croppedBlobs = [];
        document.getElementById('postImageName').innerText = "Add Photo";
    }

    function confirmCrop() {
        if (!cropperInstance) return;
        cropperInstance.getCroppedCanvas({ width: 1080, height: 1080 }).toBlob((blob) => {
            croppedBlobs[currentCropIndex] = blob;
            
            if (currentCropIndex < selectedImages.length - 1) {
                currentCropIndex++;
                renderCropperThumbnails();
                loadCropperForIndex(currentCropIndex);
            } else {
                finishCropping();
            }
        }, 'image/jpeg', 0.85);
    }

    function finishCropping() {
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        document.getElementById('cropperModal').classList.add('hidden');
        document.getElementById('postImageName').innerText = `${croppedBlobs.length} Photos Ready`;
    }
    // --- CROPPER LOGIC END ---

    async function submitPost() {
    const fd = new FormData();
    
    
    let content = document.getElementById('postContent').value;
    let linkVal = document.getElementById('postLink').value;
    
    if(linkVal) {
        if (!linkVal.startsWith('http')) linkVal = 'https://' + linkVal;
        content += "\n" + linkVal;
    }
    
    fd.append('content', content);

    // Multi-image handling
    if (croppedBlobs && croppedBlobs.length > 0) {
        let totalSize = 0;
        for (let blob of croppedBlobs) {
            if (blob) totalSize += blob.size;
        }
        if (totalSize > 49 * 1024 * 1024) {
            alert("Total size of images exceeds 49MB. Please reduce the number of images.");
            return;
        }
        
        // Append all to 'postImages' (for updated backend)
        for (let i = 0; i < croppedBlobs.length; i++) {
            if (croppedBlobs[i]) {
                fd.append('postImages', croppedBlobs[i], selectedImages[i].name);
            }
        }

    } else {
        // Fallback if cropper was bypassed
        const f = document.getElementById('postImage').files[0];
        if(f) {
            if (f.size > 49 * 1024 * 1024) {
                alert("Image size exceeds 49MB.");
                return;
            }
            fd.append('postImage', f);
        }
    }
    try {
        const progressModal = document.getElementById('uploadProgressModal');
        if(progressModal) progressModal.classList.remove('hidden');
        
        currentUploadTask = axios.CancelToken.source();

        const res = await axios.post(`${API_BASE}/api/posts/create`, fd, {
            headers: { 'x-auth-token': localStorage.getItem("token") },
            cancelToken: currentUploadTask.token,
            onUploadProgress: (p) => {
                const perc = Math.round((p.loaded * 100) / p.total);
                const percEl = document.getElementById('uploadPercentage');
                if(percEl) percEl.innerText = perc + "%";
            }
        });

        document.getElementById('postModal').classList.add('hidden');
        document.getElementById('postContent').value = "";
        document.getElementById('postLink').value = "";
        document.getElementById('postImage').value = "";
        const pin = document.getElementById('postImageName');
        if(pin) pin.innerText = "Add Photo";
        
        // Reset cropper globals
        selectedImages = [];
        croppedBlobs = [];
        
        if(progressModal) progressModal.classList.add('hidden');
        showToast("Post Uploaded!");
        renderView('feed');
    } catch (e) {
        console.error(e);
        const progressModal = document.getElementById('uploadProgressModal');
        if(progressModal) progressModal.classList.add('hidden');
        if (axios.isCancel(e)) {
            showToast("Upload Cancelled");
        } else {
            alert("Upload failed. If you uploaded multiple photos, make sure your backend is updated to support 'postImages' array, or try uploading just 1 photo.");
        }
    }
}


    async function toggleLike(id) {
        window.trackInteraction(id);
        const icon = document.getElementById(`like-icon-${id}`);
        const countSpan = document.getElementById(`like-cnt-${id}`);
        if (icon && countSpan) {
            let count = parseInt(countSpan.innerText);
            if (icon.classList.contains('text-red-500')) { icon.classList.remove('text-red-500', 'font-bold'); icon.classList.add('text-gray-500'); countSpan.innerText = Math.max(0, count - 1); } else { icon.classList.remove('text-gray-500'); icon.classList.add('text-red-500', 'font-bold'); countSpan.innerText = count + 1; }
        }
        try { await APIService.feed.like(id); } catch(e) { console.error("Like failed", e); }
    }

    function toggleComment(id) { document.getElementById(`comments-${id}`).classList.toggle('hidden'); }

    async function postComment(id) {
        window.trackInteraction(id);
        const input = document.getElementById(`inp-${id}`);
        const text = input.value;
        if(!text) return;
        const list = document.getElementById(`cmt-list-${id}`);
        const countSpan = document.getElementById(`cmt-cnt-${id}`);
        const myName = localStorage.getItem("userName") || "Me";
        const myPhoto = localStorage.getItem("userPhoto") || "https://placehold.co/30";
        const tempId = 'temp-' + Date.now();
        const html = `
            <div class="flex gap-2 items-start group" id="comment-item-${tempId}">
                <img src="${myPhoto}" class="w-8 h-8 rounded-full border border-gray-200 mt-1 object-cover">
                <div class="bg-gray-100 p-2.5 rounded-2xl rounded-tl-none relative w-full max-w-[85%]">
                    <div class="flex justify-between items-center mb-0.5"><span class="font-bold text-xs text-gray-900">${myName}</span></div>
                    <p class="text-xs text-gray-700 leading-snug">${text}</p>
                </div>
            </div>`;
        if(list) list.insertAdjacentHTML('afterbegin', html);
        if(countSpan) countSpan.innerText = parseInt(countSpan.innerText) + 1;
        input.value = "";
        try { await APIService.feed.comment(id, text); } catch(e) { console.error("Comment failed"); }
    }

    async function toggleFollow(id, btn) { const res = await APIService.user.follow(id); if(res.status === 'followed') { btn.innerText = txt("unfollow"); btn.className = "btn-follow btn-following"; myFollowing.push(id); showToast("Following!"); } else { btn.innerText = txt("follow"); btn.className = "btn-follow btn-not-following"; myFollowing = myFollowing.filter(uid => uid !== id); showToast("Unfollowed"); } updateMyStats(); }
    function openConfirmModal(title, message, actionCallback) { 
        document.getElementById('modalTitle').innerText = title; 
        document.getElementById('modalMessage').innerText = message; 
        pendingConfirmAction = actionCallback; 
        const iconWrap = document.querySelector('#universalConfirmModal .modal-icon-wrap');
        if(iconWrap) { iconWrap.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>'; iconWrap.style.backgroundColor = ''; }
        const btn = document.getElementById('modalConfirmBtn');
        if(btn) { btn.innerText = "Yes, Proceed"; btn.style.backgroundColor = ''; }
        document.getElementById('universalConfirmModal').style.display = 'flex'; 
    }
    
    function openAlertModal(title, message) { 
        document.getElementById('modalTitle').innerText = title; 
        document.getElementById('modalMessage').innerText = message; 
        document.querySelector('#universalConfirmModal .btn-cancel').style.display = 'none'; 
        pendingConfirmAction = null; 
        const iconWrap = document.querySelector('#universalConfirmModal .modal-icon-wrap');
        const btn = document.getElementById('modalConfirmBtn');
        if(btn) btn.innerText = "OK"; 
        
        if (title.toLowerCase().includes('success')) {
            if(iconWrap) { iconWrap.innerHTML = '<i class="fa-solid fa-check" style="color: #22c55e;"></i>'; iconWrap.style.backgroundColor = '#dcfce7'; }
            if(btn) btn.style.backgroundColor = '#22c55e';
        } else {
            if(iconWrap) { iconWrap.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>'; iconWrap.style.backgroundColor = ''; }
            if(btn) btn.style.backgroundColor = '';
        }
        document.getElementById('universalConfirmModal').style.display = 'flex'; 
    }
    
    function closeConfirmModal() { 
        document.getElementById('universalConfirmModal').style.display = 'none'; 
        pendingConfirmAction = null; 
        document.querySelector('#universalConfirmModal .btn-cancel').style.display = 'block'; 
        const btn = document.getElementById('modalConfirmBtn');
        if(btn) { btn.innerText = "Yes, Proceed"; btn.style.backgroundColor = ''; }
        const iconWrap = document.querySelector('#universalConfirmModal .modal-icon-wrap');
        if(iconWrap) { iconWrap.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>'; iconWrap.style.backgroundColor = ''; }
    }
    async function executeConfirmAction() { 
        if(pendingConfirmAction) { 
            const btn = document.getElementById('modalConfirmBtn');
            const cancelBtn = document.querySelector('#universalConfirmModal .btn-cancel');
            if(btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Wait...';
            if(cancelBtn) cancelBtn.style.display = 'none';
            await pendingConfirmAction(); 
        } 
        closeConfirmModal(); 
    }

    function deletePost(id) {
        openConfirmModal("Delete Post?", "Are you sure you want to permanently delete this post?", async () => {
            let deleted = JSON.parse(sessionStorage.getItem('deletedPosts') || '[]');
            deleted.push(id);
            sessionStorage.setItem('deletedPosts', JSON.stringify(deleted));

            if (window.allPosts) {
                window.allPosts = window.allPosts.filter(p => p._id !== id);
            }

            const el = document.getElementById(`post-container-${id}`);
            if(el) { el.style.transition = "all 0.3s"; el.style.opacity = "0"; setTimeout(() => el.remove(), 300); }
            
            const elProf = document.getElementById(`post-wrapper-${id}`);
            if(elProf) { elProf.style.transition = "all 0.3s"; elProf.style.opacity = "0"; setTimeout(() => elProf.remove(), 300); }

            const elCmt = document.getElementById(`comments-${id}`);
            if(elCmt) { elCmt.remove(); }

            try { 
                await APIService.feed.delete(id); 
                showToast("Post Deleted"); 
                if (document.getElementById('single-post-view')) {
                     renderView('feed');
                }
            } catch(e) { showToast("Error deleting post"); }
        });
    }

    function reportUser(id, username) {
        if (username && username.toLowerCase() === 'zobbly.com') { openAlertModal("⚠️ Action Restricted", "You cannot report the official zobbly.com account."); return; }
        openConfirmModal("Report User?", "Do you want to report this user for violating community guidelines?", async () => { showToast("User Reported Successfully!"); });
    }

    async function blockUser(id, username) {
        if (username && username.toLowerCase() === 'zobbly.com') { openAlertModal("⚠️ Action Restricted", "You cannot block the official zobbly.com account."); return; }
        const isBlocked = myBlockedUsers.some(b => (typeof b === 'object' ? b._id === id : b === id));
        const action = isBlocked ? "Unblock" : "Block";
        openConfirmModal(`${action} User?`, `Are you sure you want to ${action.toLowerCase()} this user?`, async () => {
            if (isBlocked) {
                myBlockedUsers = myBlockedUsers.filter(uid => (typeof uid === 'object' ? uid._id !== id : uid !== id));
                await APIService.user.block(id);
                showToast("User Unblocked");
                if (document.querySelector('.nav-active').id === 'nav-feed') renderView('feed'); else if (document.getElementById('profile-view')) viewUserProfile(id);
            } else {
                myBlockedUsers.push(id);
                const allPosts = document.querySelectorAll(`div[data-userid="${id}"]`);
                allPosts.forEach(post => { post.style.transition = 'all 0.3s'; post.style.opacity = '0'; setTimeout(() => post.remove(), 300); });
                showToast("User Blocked");
                await APIService.user.block(id);
                if (document.getElementById('profile-view')) viewUserProfile(id);
            }
        });
    }
    
   
function closeAllActiveElements() {
    document.querySelectorAll('[id^="post-menu-"], [id^="profile-menu"], .dropdown-menu').forEach(menu => {
        menu.classList.add('hidden');
    });

    document.querySelectorAll('[id^="comments-"]').forEach(section => {
        section.classList.add('hidden');
        const video = section.querySelector('video');
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
    });

   document.querySelectorAll('[id^="repost-panel-"]').forEach(panel => {
        panel.classList.add('hidden');
    });
}


function toggleComment(postId) {
    const targetSection = document.getElementById(`comments-${postId}`);
    if (!targetSection) return;

    const isAlreadyOpen = !targetSection.classList.contains('hidden');

    closeAllActiveElements();

    if (!isAlreadyOpen) {
        targetSection.classList.remove('hidden');
    }
}


function togglePostMenu(postId, event) {
    if (event) event.stopPropagation(); 
    
    const targetMenu = document.getElementById(`post-menu-${postId}`);
    const isAlreadyOpen = !targetMenu.classList.contains('hidden');

    closeAllActiveElements();

    if (!isAlreadyOpen) {
        targetMenu.classList.remove('hidden');
    }
}
    
    async function viewUserProfile(id) {
    const container = document.getElementById('main-content');
    container.innerHTML = '<div class="text-center mt-20"><i class="fa-solid fa-spinner fa-spin text-4xl text-purple-600"></i></div>';
    
    const data = await APIService.user.getProfile(id);
    const u = data.user; 
    let posts = data.posts; 
    let deleted = JSON.parse(sessionStorage.getItem('deletedPosts') || '[]');
    posts = posts.filter(p => !deleted.includes(p._id));
    const exps = u.experience || [];
    const myId = localStorage.getItem("userId");
    const isMe = id === myId;
    const isFollowing = myFollowing.includes(id);
    const isBlocked = myBlockedUsers.some(b => (typeof b === 'object' ? b._id === id : b === id));

    container.innerHTML = `
        <div id="profile-view" class="glass-card p-6 mb-4 text-center relative overflow-hidden">
            <button onclick="renderView('feed')" class="absolute top-4 left-4 text-white z-10 bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-sm transition"><i class="fa-solid fa-arrow-left"></i></button>
            ${!isMe ? `<div class="absolute top-4 right-4 z-20"><button onclick="document.getElementById('profile-menu').classList.toggle('hidden')" class="text-white bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-sm transition"><i class="fa-solid fa-ellipsis-vertical"></i></button><div id="profile-menu" class="hidden absolute right-0 top-10 bg-white shadow-xl rounded-lg w-32 overflow-hidden border z-30"><button onclick="blockUser('${u._id}', '${u.username}')" class="w-full text-left p-3 text-sm hover:bg-gray-100 text-red-600 border-b"><i class="fa-solid fa-ban mr-2"></i>${isBlocked ? txt('unblock') : txt('block')}</button><button onclick="reportUser('${u._id}', '${u.username}')" class="w-full text-left p-3 text-sm hover:bg-gray-100 text-gray-700"><i class="fa-solid fa-flag mr-2"></i>${txt('report')}</button></div></div>` : ''}
            <div class="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-purple-400 to-pink-400 opacity-50"></div>
            <img src="${(u.photo ? u.photo + '?t=' + Date.now() : 'https://placehold.co/100')}" class="relative w-24 h-24 rounded-full mx-auto mb-2 object-cover border-4 border-white shadow-xl" ${isMe ? 'onclick="document.getElementById(\'photoInput\').click()"' : ''}>
            ${isMe ? '<input type="file" id="photoInput" class="hidden" onchange="APIService.user.uploadPhoto(this.files[0])">' : ''}
            <h1 class="text-2xl font-black text-gray-800">${u.name}</h1>
            <p class="text-purple-600 font-medium mb-2 text-sm">${u.headline||'Member'} ${u.username ? `<br><span class="text-xs text-gray-500">@${u.username}</span>` : ''} ${u.country ? `<br><span class="text-xs text-gray-400"><i class="fa-solid fa-location-dot"></i> ${u.country}</span>` : ''}</p>
            
            <div class="flex justify-center gap-6 my-4 text-sm font-bold text-gray-600">
                <button onclick="openFollowList('${u._id}', 'followers')" class="text-center hover:bg-purple-50 p-2 rounded-lg transition"><span class="block text-xl text-black">${u.followers ? u.followers.length : 0}</span>${txt('followers')}</button>
                <button onclick="openFollowList('${u._id}', 'following')" class="text-center hover:bg-purple-50 p-2 rounded-lg transition"><span class="block text-xl text-black">${u.following ? u.following.length : 0}</span>${txt('following')}</button>
            </div>

            ${!isMe ? (isBlocked ? '<p class="text-red-500 font-bold text-sm">You have blocked this user.</p>' : `<button onclick="toggleFollow('${u._id}', this)" class="btn-zobbly px-6 py-2 rounded-full font-bold shadow-lg text-sm">${isFollowing ? txt('unfollow') : txt('follow')}</button><button onclick="startChat('${u._id}', '${u.name}', '${u.photo}')" class="ml-2 bg-white text-purple-600 border border-purple-200 px-4 py-2 rounded-full font-bold"><i class="fa-solid fa-message"></i></button>`) : `<button class="bg-gray-200 px-4 py-1 rounded-full text-xs font-bold" onclick="openEditProfile()">${txt('editProfile')}</button>`}
        </div>

        ${isBlocked ? '<div class="p-10 text-center text-gray-400">Content hidden because you blocked this user.</div>' : `
        
        <div class="glass-card p-4 mb-4">
            <div class="flex justify-between mb-3 border-b border-gray-200/50 pb-2">
                <h2 class="font-bold text-md text-gray-800">${txt('experience')}</h2>
                ${isMe ? `<button onclick="openExpModal()" class="text-lg text-purple-600"><i class="fa-solid fa-plus"></i></button>` : ''}
            </div>
            <div>
                ${exps.map(e=>`<div class="mb-3 p-3 bg-white/50 rounded-xl flex justify-between"><div><h3 class="font-bold text-gray-800 text-sm">${e.company}</h3><p class="text-xs text-purple-600">${e.role}</p><p class="text-[10px] text-gray-400">${e.year}</p></div>${isMe ? `<div class="flex items-center gap-2"><button onclick="openExpModal('${e._id}','${e.company}','${e.role}','${e.year}')" class="text-blue-500"><i class="fa-solid fa-pencil"></i></button><button onclick="deleteExp('${e._id}')" class="text-red-500"><i class="fa-solid fa-trash"></i></button></div>` : ''}</div>`).join('')}
            </div>
        </div>

        <div class="glass-card p-4">
            <h2 class="text-md font-bold mb-3 text-gray-800 border-b border-gray-200/50 pb-2">${txt('activity')}</h2>
            
            <div class="grid grid-cols-3 gap-1">
               ${posts.length === 0 ? '<p class="col-span-3 text-center text-gray-400 text-sm py-10">No posts yet.</p>' : posts.map(p => {
                    const mediaUrl = p.video || p.image;
                    const isVideo = (p.video) || (p.image && ['.mp4', '.webm', '.mov', '.ogg'].some(ext => p.image.toLowerCase().endsWith(ext)));
                    let displayContent = p.content || '';
                    let linkHtml = '';
                    if (p.link) {
                         displayContent = displayContent.replace(p.link, '').trim();
                         linkHtml = generateLinkHtml(p.link);
                    } else {
                        const urlRegex = /(https?:\/\/[^\s]+)/g;
                        const detectedLinks = displayContent.match(urlRegex);
                        if(detectedLinks && detectedLinks.length > 0) {
                              const firstLink = detectedLinks[0];
                              displayContent = displayContent.replace(firstLink, '').trim();
                              linkHtml = generateLinkHtml(firstLink);
                        }
                    }

                    return `
                    <div id="post-wrapper-${p._id}" class="contents">
                        <div class="relative aspect-square bg-gray-200 overflow-hidden cursor-pointer group" onclick="toggleComment('${p._id}')">
                            
                             ${isMe ? `<button onclick="event.stopPropagation(); deletePost('${p._id}')" class="absolute top-2 right-2 z-20 bg-black/60 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition shadow-md backdrop-blur-sm"><i class="fa-solid fa-trash text-xs"></i></button>` : ''}
                            ${(p.images && p.images.length > 0) ?
                                `<img src="${p.images[0]}" class="w-full h-full object-cover block">
                                 ${p.images.length > 1 ? `<div class="absolute top-2 right-2 bg-black/50 text-white p-1 rounded"><i class="fa-solid fa-clone text-xs"></i></div>` : ''}`
                            : (mediaUrl ? 
                                (isVideo ? 
                                    `<video src="${mediaUrl}" class="w-full h-full object-cover block" preload="metadata" muted playsinline></video>
                                     <div class="absolute inset-0 flex items-center justify-center pointer-events-none"><i class="fa-solid fa-play text-white/80 text-xl shadow-sm"></i></div>` : 
                                    `<img src="${mediaUrl}" class="w-full h-full object-cover block">`) 
                                : `<div class="w-full h-full flex items-center justify-center p-2 bg-purple-100 text-[10px] text-gray-700 font-bold text-center break-words">${displayContent.substring(0, 50)}</div>`)
                            }
                            <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3 text-white font-bold text-xs pointer-events-none">
                                <span><i class="fa-solid fa-heart"></i> ${p.likes.length}</span>
                                <span><i class="fa-solid fa-comment"></i> ${p.comments.length}</span>
                            </div>
                        </div>

                        <div id="comments-${p._id}" class="hidden col-span-3 bg-white border border-gray-100 mt-1 mb-4 rounded-xl shadow-2xl overflow-hidden">
                            <div class="p-3 border-b flex justify-between items-center bg-white">
                                <div class="flex items-center gap-2">
                                    <img src="${u.photo||'https://placehold.co/30'}" class="w-8 h-8 rounded-full object-cover">
                                    <span class="text-sm font-bold text-gray-800">${u.username || u.name}</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    ${isMe ? `<button onclick="deletePost('${p._id}')" class="bg-red-50 text-red-500 hover:bg-red-100 px-3 py-1 rounded-lg text-xs font-bold transition"><i class="fa-solid fa-trash mr-1"></i>Delete Post</button>` : ''}
                                    <button onclick="toggleComment('${p._id}')" class="text-gray-400 hover:text-black"><i class="fa-solid fa-xmark text-xl"></i></button>
                                </div>
                            </div>

                            <div class="w-full bg-black min-h-[300px] flex items-center justify-center relative">
                                ${isVideo ? 
                                    `<video src="${mediaUrl}" id="vid-prof-${p._id}" controls loop class="w-full max-h-[500px] block" playsinline></video>` : 
                                    (mediaUrl ? `<img src="${mediaUrl}" class="w-full max-h-[500px] object-contain block">` : '')
                                }
                            </div>

                            <div class="p-4 bg-white">
                                <p class="text-sm text-gray-700 mb-2 whitespace-pre-line">${displayContent}</p>
                                
                                ${linkHtml}
                                
                                <div class="flex items-center gap-6 border-y border-gray-50 py-3 mb-4">
                                    <button onclick="toggleLike('${p._id}')" class="flex items-center gap-2 text-sm">
                                        <i class="fa-solid fa-heart ${p.likes.includes(myId)?'text-red-500 font-bold':'text-gray-300'}" id="like-icon-${p._id}"></i>
                                        <span id="like-cnt-${p._id}" class="font-bold text-gray-800">${p.likes.length}</span>
                                    </button>
                                    <span class="text-sm text-gray-500 font-medium"><i class="fa-solid fa-comment mr-1 text-gray-300"></i> ${p.comments.length}</span>
                                </div>

                                <div class="max-h-60 overflow-y-auto space-y-4 mb-4" id="cmt-list-${p._id}">
                                ${p.comments.map(cm => {
   
                                  const myId = localStorage.getItem("userId");
                                  const isPostOwner = p.userId && (p.userId._id === myId || p.userId === myId);
                                  const isCommentOwner = cm.userId && (cm.userId._id === myId || cm.userId === myId);
                                  const canDelete = isPostOwner || isCommentOwner;

                                 return `
                                    <div class="flex gap-3 text-xs group" id="comment-item-${cm._id}">
                                       <img src="${cm.userId?.photo || 'https://placehold.co/20'}" class="w-8 h-8 rounded-full object-cover">
                                          <div class="flex-1 bg-gray-50 p-2 rounded-lg relative">
                                               <div class="flex justify-between items-center mb-1">
                                                      <span class="font-bold">${cm.userName || 'User'}</span>
                
                                              ${canDelete ? `<button onclick="deleteComment('${p._id}', '${cm._id}')" class="text-red-400 hover:text-red-600 transition p-1"><i class="fa-solid fa-trash"></i></button>` : ''}
            
                                              </div>
                                            <p class="text-gray-600">${cm.text}</p>
                                           </div>
                                      </div>`;
                                }).join('')}
                            </div>

                            <div class="flex gap-2 items-center bg-gray-50 p-2 rounded-full border border-gray-100">
                                <input id="inp-${p._id}" type="text" class="flex-1 p-1 text-xs bg-transparent outline-none px-2" placeholder="Write a comment...">
                                <button onclick="postComment('${p._id}')" class="text-purple-600 font-bold text-xs px-2">Post</button>
                            </div>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        </div>`}`;
}
    function openExpModal(id, c, r, y) { currentExpId = id; document.getElementById('modalContent').innerHTML = `<h2 class="text-lg font-bold mb-4 text-gray-800">${id?'Edit':'Add'} Experience</h2><input id="expCompany" value="${c||''}" placeholder="Company" class="w-full mb-3 p-3 bg-gray-50 rounded-xl border-none text-sm"><input id="expRole" value="${r||''}" placeholder="Role" class="w-full mb-3 p-3 bg-gray-50 rounded-xl border-none text-sm"><input id="expYear" value="${y||''}" placeholder="Year" class="w-full mb-4 p-3 bg-gray-50 rounded-xl border-none text-sm"><button onclick="submitExp()" class="btn-zobbly w-full py-2 rounded-xl font-bold text-sm">Save</button>`; document.getElementById('genericModal').classList.remove('hidden'); }
    async function submitExp() { const d = { company: document.getElementById('expCompany').value, role: document.getElementById('expRole').value, year: document.getElementById('expYear').value }; if(currentExpId) await APIService.user.editExperience(currentExpId, d); else await APIService.user.addExperience(d); closeModal(); viewUserProfile(localStorage.getItem("userId")); }

    async function deleteExp(id) { openConfirmModal("Delete Experience?", "Are you sure you want to remove this experience?", async () => { await APIService.user.deleteExperience(id); viewUserProfile(localStorage.getItem("userId")); }); }
    function closeModal() { document.getElementById('genericModal').classList.add('hidden'); }
    async function saveProfile() { const selectedLang = document.getElementById('editLang').value; localStorage.setItem('appLang', selectedLang); await APIService.user.update(document.getElementById('editName').value, document.getElementById('editHeadline').value); localStorage.setItem("userName", document.getElementById('editName').value); location.reload(); }
    async function backupData() { await APIService.user.backup(); }
    async function deleteAccount() { openConfirmModal("Delete Account?", "Warning: This will permanently delete your account and all data. This cannot be undone.", async () => { await APIService.user.delete(); APIService.auth.logout(); }); }
    function showToast(msg) { const t = document.getElementById('toast'); document.getElementById('toast-msg').innerText = msg; t.classList.remove('opacity-0', 'pointer-events-none'); t.classList.add('opacity-100', '-translate-y-10'); setTimeout(()=>{ t.classList.remove('opacity-100', '-translate-y-10'); t.classList.add('opacity-0', 'pointer-events-none'); }, 3000); }

    window.onload = checkLoginStatus;
    async function openFollowList(userId, type) {
        const modal = document.getElementById('genericModal');
        const content = document.getElementById('modalContent');
        modal.classList.remove('hidden');
        content.innerHTML = `<div class="text-center mt-10"><i class="fa-solid fa-spinner fa-spin text-2xl text-purple-600"></i></div>`;
        try {
            let list = [];
            if(type === 'followers') { list = await APIService.user.getFollowers(userId); } else { list = await APIService.user.getFollowing(userId); }
            let html = `<div class="sticky top-0 bg-white z-10 pb-2 border-b mb-4 flex justify-between items-center"><h2 class="text-xl font-bold capitalize">${type}</h2><span class="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs font-bold">${list.length}</span></div><div class="space-y-2">`;
            if(list.length === 0) { html += `<div class="text-center text-gray-400 py-10 flex flex-col items-center"><i class="fa-solid fa-users-slash text-3xl mb-2"></i><p>No ${type} found.</p></div>`; } else {
                html += list.map(u => `
                    <div class="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition border border-transparent hover:border-gray-100" onclick="closeModal(); viewUserProfile('${u._id}')">
                        <div class="flex items-center gap-3">
                            <img src="${u.photo || 'https://placehold.co/40'}" class="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm">
                            <div><h4 class="font-bold text-sm text-gray-800">${u.name}</h4><p class="text-xs text-gray-500">@${u.username || 'user'}</p></div>
                        </div>
                        <i class="fa-solid fa-chevron-right text-gray-300 text-xs"></i>
                    </div>`).join('');
            }
            html += `</div>`;
            content.innerHTML = html;
        } catch(e) { console.error(e); content.innerHTML = '<p class="text-red-500 text-center mt-10">Error loading list. Try again.</p>'; }
    }
    

function renderJobs(container) {
    container.innerHTML = `
    <div class="glass-card p-6 animate-pop-view">
        <div class="mb-6 text-center">
            <h2 class="text-2xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">${txt('jobs')}</h2>
            <p class="text-gray-500 text-sm">Find your dream career easily.</p>
        </div>
        <div class="flex flex-col gap-4 relative z-20">
            <div class="relative" id="source-dropdown-container">
                <input type="hidden" id="api-source" value="mantiks">
                <button onclick="toggleCustomDropdown('source-dropdown-menu', this)" class="custom-dropdown-trigger w-full p-3.5 rounded-xl flex justify-between items-center text-gray-800 font-medium outline-none text-sm">
                    <span id="source-selected-text" class="flex items-center gap-3"><i class="fa-solid fa-briefcase text-purple-500"></i> Job Title (Default)</span>
                    <i class="fa-solid fa-chevron-down text-gray-400 text-sm"></i>
                </button>
                <div id="source-dropdown-menu" class="custom-dropdown-menu scrollbar-hide">
                    <div class="dropdown-option selected" onclick="selectCustomOption('mantiks', 'Job Title (Default)', 'fa-briefcase', 'source')"><i class="fa-solid fa-briefcase text-purple-500 w-6"></i> Job Title</div>
                    <div class="dropdown-option" onclick="selectCustomOption('mantiks-company', 'Search by Company', 'fa-building', 'source')"><i class="fa-solid fa-building text-blue-500 w-6"></i> Search by Company</div>
                    <div class="dropdown-option" onclick="selectCustomOption('adzuna', 'Adzuna Jobs', 'fa-a', 'source')"><i class="fa-solid fa-a text-green-500 w-6"></i> Adzuna Jobs</div>
                    <div class="dropdown-option" onclick="selectCustomOption('jsearch', 'JSearch Network', 'fa-network-wired', 'source')"><i class="fa-solid fa-network-wired text-red-500 w-6"></i> JSearch Network</div>
                    <div class="dropdown-option" onclick="selectCustomOption('google', 'Google Jobs', 'fa-google', 'source')"><i class="fa-brands fa-google text-orange-500 w-6"></i> Google Jobs</div>
                </div>
            </div>
            
            <div class="relative group"><i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition"></i><input id="job-what" type="text" placeholder="Job Title, Keywords..." class="w-full p-3.5 pl-11 rounded-xl border border-gray-200/80 bg-white/60 backdrop-blur-md text-sm outline-none focus:ring-2 ring-purple-200 focus:border-purple-300 transition shadow-sm"></div>
            <div id="location-box" class="relative group"><i class="fa-solid fa-location-dot absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition"></i><input id="job-where" type="text" placeholder="City, State or Zip" class="w-full p-3.5 pl-11 rounded-xl border border-gray-200/80 bg-white/60 backdrop-blur-md text-sm outline-none focus:ring-2 ring-pink-200 focus:border-pink-300 transition shadow-sm"></div>
            
            <button onclick="searchJobsAction()" class="btn-zobbly w-full py-3.5 rounded-xl font-bold text-sm shadow-lg text-white flex items-center justify-center gap-2 mt-2 relative overflow-hidden group"><span class="relative z-10">Search Jobs</span><i class="fa-solid fa-arrow-right relative z-10 group-hover:translate-x-1 transition"></i><div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition duration-300"></div></button>
        </div>
        <div id="jobList" class="mt-6 space-y-3 relative z-10"></div>
    </div>`;
    applyTranslations();
}


function toggleInputs(source) { 
    document.getElementById("job-what").placeholder = source === "mantiks-company" ? "Company Name" : "Job Title"; 
}


async function searchJobsAction() {
    const source = document.getElementById("api-source").value; 
    const what = document.getElementById("job-what").value; 
    const where = document.getElementById("job-where").value;
    const list = document.getElementById("jobList"); 
    
    list.innerHTML = "<p class='text-center text-gray-500'>Searching...</p>";
    
    let ep = ""; 
    if(source==="mantiks") ep=`/jobs/mantiks?what=${what}`; 
    else if(source==="mantiks-company") ep=`/jobs/mantiks/company?name=${what}`; 
    else if(source==="adzuna") ep=`/jobs/adzuna?what=${what}&where=${where}`; 
    else if(source==="jsearch") ep=`/jobs/jsearch?query=${what} in ${where}`; 
    else ep=`/jobs/google?q=${what}&location=${where}`;
    
    try { 
        const res = await APIService.jobs.search(ep); 
        list.innerHTML = res.data.map(j => `
            <div class="bg-white p-3 rounded shadow-sm mb-2 border border-gray-100">
                <h3 class="font-bold text-blue-600 text-sm">
                    <a href="${j.job_apply_link||j.redirect_url||'#'}" target="_blank">${j.job_title||j.title}</a>
                </h3>
                <p class="text-xs text-gray-600">${j.company_name||j.company?.display_name||j.employer_name}</p>
            </div>`
        ).join(''); 
    } catch(e){
        list.innerHTML="<p class='text-center text-red-500'>Error loading jobs.</p>";
    }
}


async function checkNotifs() {
    try {
        const notifs = await APIService.notifications.getAll();
        const unread = notifs.filter(n => !n.isRead).length;
        if(unread > 0) { 
            document.getElementById('notif-badge').classList.remove('hidden'); 
            document.getElementById('notif-badge-static').classList.remove('hidden'); 
        } else { 
            document.getElementById('notif-badge').classList.add('hidden'); 
            document.getElementById('notif-badge-static').classList.add('hidden'); 
        }
    } catch(e){}
}


async function renderNotifications(c) {
    const notifs = await APIService.notifications.getAll();
    c.innerHTML = `
        <div class="glass-card p-4">
            <div class="flex justify-between items-center mb-4">
                <h2 class="font-bold text-lg">${txt('notifications')}</h2>
                <span class="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full font-bold">${notifs.length} New</span>
            </div>
            <div class="space-y-3">
                ${notifs.length === 0 ? '<div class="text-center text-gray-400 py-10"><i class="fa-regular fa-bell text-3xl mb-2"></i><p class="text-sm">All caught up!</p></div>' : notifs.map(n => {
                    const actor = n.fromUser || n.sender || n.user || n.userId || {};
                    const userPhoto = actor.photo || 'https://placehold.co/40';
                    const userName = actor.name || 'Zobbly User';
                    const actorId = actor._id || '';
                    const timeAgo = formatTimeAgo(n.createdAt || new Date());
                    
                    let iconClass = 'fa-bell text-gray-500'; let bgClass = 'bg-gray-100';
                    if (n.type === 'like') { iconClass = 'fa-heart text-red-500'; bgClass='bg-red-50'; }
                    else if (n.type === 'comment') { iconClass = 'fa-comment text-blue-500'; bgClass='bg-blue-50'; }
                    else if (n.type === 'follow') { iconClass = 'fa-user-plus text-green-500'; bgClass='bg-green-50'; }
                    else if (n.type === 'message') { iconClass = 'fa-envelope text-purple-500'; bgClass='bg-purple-50'; }
                    
                    return `
                    <div id="notif-item-${n._id}" class="p-3 rounded-xl bg-white/60 hover:bg-white/90 cursor-pointer flex gap-3 items-center border border-white shadow-sm transition transform active:scale-95 group relative" onclick="handleNotifClick('${n.type}', '${n.relatedId}', '${actorId}')">
                        <div class="relative">
                            <img src="${userPhoto}" class="w-12 h-12 rounded-full object-cover border border-gray-200">
                            <div class="absolute -bottom-1 -right-1 w-5 h-5 ${bgClass} rounded-full flex items-center justify-center border border-white">
                                <i class="fa-solid ${iconClass} text-[10px]"></i>
                            </div>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm text-gray-800 leading-snug"><span class="font-bold">${userName}</span> ${getNotifText(n.type)}</p>
                            <p class="text-[10px] text-gray-400 font-medium mt-1">${timeAgo}</p>
                        </div>
                        <button onclick="deleteNotification(event, '${n._id}')" class="text-gray-300 hover:text-red-500 transition p-2 z-10"><i class="fa-solid fa-trash"></i></button>
                        ${!n.isRead ? '<div class="w-2 h-2 bg-purple-500 rounded-full"></div>' : ''}
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    applyTranslations();
}


function getNotifText(type) { 
    if(type === 'like') return 'liked your post.'; 
    if(type === 'comment') return 'commented on your post.'; 
    if(type === 'follow') return 'started following you.'; 
    if(type === 'message') return 'sent you a message.'; 
    return 'interacted with you.'; 
}


function handleNotifClick(type, relatedId, actorId) {
    if(type === 'message') {
        if(actorId) {
            APIService.user.getProfile(actorId).then(data => {
                startChat(actorId, data.user.name, data.user.photo);
            }).catch(() => renderView('chat'));
        } else { renderView('chat'); }
    }
    else if(type === 'follow') { viewUserProfile(actorId); }
    else if(type === 'like' || type === 'comment' || type === 'post') { viewSinglePost(relatedId); }
    else { renderView('feed'); }
}


async function deleteNotification(e, id) { 
    e.stopPropagation(); 
    openConfirmModal("Delete Notification?", "Remove this notification?", async () => { 
        const el = document.getElementById(`notif-item-${id}`); 
        if(el) { 
            el.style.transition = "all 0.3s"; 
            el.style.opacity = "0"; 
            setTimeout(() => el.remove(), 300); 
        } 
        try { await APIService.notifications.delete(id); showToast("Notification deleted"); } 
        catch(err) { showToast("Error deleting"); } 
    }); 
}

async function renderChat(c) {
    c.innerHTML = `
    <div class="glass-card h-[calc(100vh-210px)] relative flex flex-col overflow-hidden p-0 w-full">
        <div class="p-3 border-b bg-white flex items-center shadow-sm z-10 shrink-0">
            <div class="flex items-center gap-2 w-full">
                <div class="flex flex-1 bg-gray-100 rounded-full overflow-hidden border border-gray-200 focus-within:border-purple-400 transition-colors">
                    <div class="pl-4 pr-2 flex items-center justify-center text-gray-400">
                        <i class="fa-solid fa-search"></i>
                    </div>
                    <input id="chat-search-input" onkeyup="if(event.key === 'Enter') executeChatSearch()" placeholder="${txt('search')}..." class="w-full py-2.5 text-sm bg-transparent outline-none pr-3">
                </div>
                <button id="chat-search-btn" onclick="executeChatSearch()" class="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md shrink-0 flex items-center gap-2">
                    <span>Search</span>
                    <i class="fa-solid fa-spinner fa-spin hidden" id="chat-search-loader"></i>
                </button>
            </div>
        </div>
        <div id="chat-list" class="flex-1 overflow-y-auto bg-white"></div>
    </div>`;
    loadConversations();
}

window.unreadChatUsers = window.unreadChatUsers || new Set();
window.readChatTimestamps = window.readChatTimestamps || {};

async function loadConversations(isPolling = false) { 
    if(isPolling && (currentView !== 'chat' || isChatOpen)) return;
    
    let users = await APIService.chat.getConversations(); 
    const myId = localStorage.getItem("userId");
    users = users.filter(u => u._id !== myId);
    
    try {
        const notifs = await APIService.notifications.getAll();
        const unreadMsgs = notifs.filter(n => !n.isRead && n.type === 'message');
        
        // Reset unread set for recalculation
        window.unreadChatUsers.clear();
        
        unreadMsgs.forEach(n => {
            const actor = n.fromUser || n.sender || n.user || n.userId || {};
            const actorId = actor._id || actor;
            const notifTime = new Date(n.createdAt || Date.now()).getTime();
            
            if (actorId) {
                // If we haven't read this chat AFTER the notification was created
                if (!window.readChatTimestamps[actorId] || window.readChatTimestamps[actorId] < notifTime) {
                    window.unreadChatUsers.add(actorId);
                }
            }
        });
    } catch(e) {}

    const list = document.getElementById('chat-list');
    if (!list) return;
    
    list.innerHTML = users.map(u => {
        const isUnread = window.unreadChatUsers && window.unreadChatUsers.has(u._id);
        const bgClass = isUnread ? 'bg-purple-50 border-l-4 border-purple-600' : 'hover:bg-purple-50 border-b border-gray-100';
        const dotHtml = isUnread ? `<span class="w-2.5 h-2.5 bg-purple-600 rounded-full"></span>` : '';
        const nameClass = isUnread ? 'text-sm font-black text-purple-900' : 'text-sm font-bold text-gray-800';
        const textClass = isUnread ? 'text-xs font-bold text-purple-600 animate-pulse' : 'text-xs text-gray-500';
        
        return `<div onclick="startChat('${u._id}','${u.name}','${u.photo}')" class="p-4 cursor-pointer flex gap-4 items-center transition ${bgClass}">
            <img src="${u.photo||'https://placehold.co/40'}" class="w-12 h-12 rounded-full border shadow-sm">
            <div class="flex-1 flex justify-between items-center">
                <div>
                    <div class="${nameClass}">${u.name}</div>
                    <div class="${textClass}">${isUnread ? 'New message!' : 'Tap to chat'}</div>
                </div>
                ${dotHtml}
            </div>
        </div>`;
    }).join(''); 
}

async function executeChatSearch() {
    const q = document.getElementById('chat-search-input').value;
    const loader = document.getElementById('chat-search-loader');
    if (loader) loader.classList.remove('hidden');
    await searchChatUsers(q);
    if (loader) loader.classList.add('hidden');
}

async function searchChatUsers(q) { 
    if(q.length < 1) return loadConversations(); 
    let users = await APIService.chat.search(q); 
    const myId = localStorage.getItem("userId");
    users = users.filter(u => u._id !== myId);
    document.getElementById('chat-list').innerHTML = users.map(u => `
        <div onclick="startChat('${u._id}','${u.name}','${u.photo}')" class="p-4 border-b cursor-pointer hover:bg-purple-50 flex gap-4 items-center transition">
            <img src="${u.photo||'https://placehold.co/40'}" class="w-12 h-12 rounded-full border shadow-sm">
            <div>
                <div class="text-sm font-bold text-gray-800">${u.name}</div>
                <div class="text-xs text-gray-500">Tap to chat</div>
            </div>
        </div>`
    ).join(''); 
}


async function startChat(id, name, photo) {
    if (window.unreadChatUsers) window.unreadChatUsers.delete(id);
    if (window.readChatTimestamps) window.readChatTimestamps[id] = Date.now();
    activeChatUser = id;
    window.chatScrolledOnce = false;
    window.pendingMessages = []; // Reset pending messages for new chat
    
    // Apply saved theme automatically
    setChatTheme(currentTheme.id);

    document.getElementById('fc-user-name').innerText = name;
    document.getElementById('fc-user-img').src = photo || 'https://placehold.co/30';
    
    if(statusInterval) clearInterval(statusInterval);
    const updateStatus = async () => {
        try {
            const data = await APIService.user.getProfile(id);
            const lastActive = new Date(data.user.lastActive || Date.now());
            const now = new Date();
            const diffMins = (now - lastActive) / 1000 / 60;
            const statusEl = document.getElementById('fc-user-status');
            if(diffMins < 5) { 
                statusEl.innerHTML = `<span class="w-2 h-2 bg-green-500 rounded-full inline-block mr-1"></span>Online`; 
                statusEl.className = "text-[10px] text-green-600 font-bold flex items-center"; 
            } else { 
                statusEl.innerText = `Last seen: ${lastActive.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`; 
                statusEl.className = "text-[10px] text-gray-500 font-medium"; 
            }
        } catch(e) {}
    };
    updateStatus(); 
    statusInterval = setInterval(updateStatus, 2000);

    const themeMenu = document.getElementById('chat-theme-menu');
    themeMenu.innerHTML = chatThemes.map(t => `<div class="theme-item" onclick="setChatTheme('${t.id}')"><div class="theme-preview" style="background: ${t.bg}"></div><span class="text-sm font-medium text-gray-700">${t.name}</span></div>`).join('');
    
    loadMsgs();
    document.getElementById('full-chat-view').classList.add('active');
    isChatOpen = true;
    
    if(window.chatInterval) clearInterval(window.chatInterval);
    window.chatInterval = setInterval(loadMsgs, 3000);
}

function closeFullChat() { 
    document.getElementById('full-chat-view').classList.remove('active'); 
    isChatOpen = false; 
    if(window.chatInterval) clearInterval(window.chatInterval); 
    if(statusInterval) clearInterval(statusInterval); 
}

async function sendMsg() {
    const input = document.getElementById('fc-input');
    const txt = input.value;
    if(!txt || !activeChatUser) return;

    const tempId = 'temp-' + Date.now();
    const pendingMsg = {
        _id: tempId,
        content: txt,
        senderId: localStorage.getItem("userId"),
        createdAt: new Date().toISOString(),
        isPending: true,
        status: 'sending'
    };
    
    if (!window.pendingMessages) window.pendingMessages = [];
    window.pendingMessages.push(pendingMsg);

    input.value = ""; 
    input.focus();
    
    await renderMsgsFromCacheAndPending(true);

    try {
        await APIService.chat.send(activeChatUser, txt);
        pendingMsg.status = 'sent';
        await renderMsgsFromCacheAndPending(true);
    } catch(e) {
        pendingMsg.status = 'failed';
        await renderMsgsFromCacheAndPending(true);
    }
}

async function retryMsg(tempId) {
    if (!window.pendingMessages) return;
    const pendingMsg = window.pendingMessages.find(m => m._id === tempId);
    if (!pendingMsg) return;

    pendingMsg.status = 'sending';
    await renderMsgsFromCacheAndPending(true);

    try {
        await APIService.chat.send(activeChatUser, pendingMsg.content);
        pendingMsg.status = 'sent';
        await renderMsgsFromCacheAndPending(true);
    } catch(e) {
        pendingMsg.status = 'failed';
        await renderMsgsFromCacheAndPending(true);
    }
}

async function uploadChatFile(file) {
    if (!file || !activeChatUser) return;
    const chatMsgs = document.getElementById('fc-messages');
    const tempId = 'temp-img-' + Date.now();
    const themeBtn = (typeof currentTheme !== 'undefined' && currentTheme.btn) ? currentTheme.btn : 'bg-purple-600';

    const reader = new FileReader();
    reader.onload = function(e) {
        const html = `
            <div class="flex justify-end mb-2" id="${tempId}">
                <div class="chat-bubble-user ${themeBtn} p-1 rounded-lg max-w-[80%] shadow-md relative overflow-hidden">
                    <img src="${e.target.result}" class="max-w-[200px] rounded-lg opacity-50 grayscale">
                    <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
                        <i class="fa-solid fa-spinner fa-spin text-white text-2xl"></i>
                    </div>
                </div>
            </div>`;
        chatMsgs.insertAdjacentHTML('beforeend', html);
        chatMsgs.scrollTop = chatMsgs.scrollHeight;
    };
    reader.readAsDataURL(file);

    const fd = new FormData();
    fd.append("chatFile", file);
    fd.append("receiverId", activeChatUser);

    try {
        await APIService.chat.upload(fd);
        const tempMsg = document.getElementById(tempId);
        if(tempMsg) tempMsg.remove(); 
        loadMsgs();
    } catch(e) {
        const tempMsg = document.getElementById(tempId);
        if(tempMsg) tempMsg.remove();
        showToast("Photo bhenjne mein dikat aayi");
    }
}

async function loadMsgs() {
    if(!activeChatUser) return;
    const chatMsgs = document.getElementById('fc-messages');
    const isNearBottom = chatMsgs ? (chatMsgs.scrollHeight - chatMsgs.scrollTop - chatMsgs.clientHeight < 100) : true;
    
    const msgs = await APIService.chat.getHistory(activeChatUser);
    window.lastServerMsgs = msgs;
    
    await renderMsgsFromCacheAndPending(isNearBottom);
}

async function renderMsgsFromCacheAndPending(isNearBottomArg) {
    const chatMsgs = document.getElementById('fc-messages');
    if (!chatMsgs) return;
    
    const isNearBottom = isNearBottomArg !== undefined ? isNearBottomArg : (chatMsgs.scrollHeight - chatMsgs.scrollTop - chatMsgs.clientHeight < 100);
    
    const myId = localStorage.getItem("userId");
    const themeBtn = (typeof currentTheme !== 'undefined' && currentTheme.btn) ? currentTheme.btn : 'bg-purple-600';
    
    let serverMsgs = window.lastServerMsgs || [];
    
    if (window.pendingMessages) {
        window.pendingMessages = window.pendingMessages.filter(pending => {
            const existsOnServer = serverMsgs.some(m => 
                m.content === pending.content && 
                m.senderId === myId && 
                Math.abs(new Date(m.createdAt).getTime() - new Date(pending.createdAt).getTime()) < 120000
            );
            return !existsOnServer;
        });
    }

    const allMsgs = [...serverMsgs, ...(window.pendingMessages || [])];

    const stateString = JSON.stringify(allMsgs) + themeBtn;
    if (window.lastRenderedChatState === stateString) {
        return; // Prevent flickering by not updating DOM if state hasn't changed
    }
    window.lastRenderedChatState = stateString;

    chatMsgs.innerHTML = allMsgs.map(m => {
        let content = m.content;
        if(m.type==='image') { 
            content = `<div class="relative inline-block"><img src="${m.fileUrl}" class="max-w-[200px] rounded-lg border shadow-sm"><button onclick="downloadImage('${m.fileUrl}')" class="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] p-1.5 rounded-full hover:bg-black/70"><i class="fa-solid fa-download"></i></button></div>`; 
        } else if(content && content.startsWith('ZOBBLY_REEL_SHARE||')) {
            const parts = content.split('||');
            const rId = parts[1];
            const rPoster = parts[2] && parts[2] !== 'undefined' && parts[2] !== 'null' && parts[2] !== '' ? parts[2] : 'https://placehold.co/200x300?text=Reel';
            content = `
            <div onclick="openSharedReel('${rId}')" class="relative w-40 h-60 rounded-xl overflow-hidden cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.2)] border border-white/50 group mt-1">
                <img src="${rPoster}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <div class="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 shadow-lg group-hover:scale-110 transition-transform">
                        <i class="fa-solid fa-play text-white text-xl ml-1"></i>
                    </div>
                </div>
                <div class="absolute bottom-3 left-3 flex items-center gap-2">
                    <i class="fa-solid fa-clapperboard text-white text-sm"></i>
                    <span class="text-white text-[11px] font-bold drop-shadow-md">Watch Reel</span>
                </div>
            </div>`;
        }
        
        const isMe = m.senderId === myId;
        const bubbleClass = isMe ? `chat-bubble-user ${themeBtn} text-white self-end` : 'chat-bubble-other self-start bg-white/90 backdrop-blur-sm';
        
        let statusHtml = new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        let opacityClass = '';
        
        const reactState = JSON.parse(localStorage.getItem('chatReactions') || '{}');
        // m.reaction backend se aayega, agar nahi aaya to fallback localStorage
        const myReaction = m.reaction || reactState[m._id] || '';
        let reactionBadge = myReaction ? `<div class="absolute -bottom-2 -right-2 bg-white rounded-full px-1.5 shadow-[0_2px_5px_rgba(0,0,0,0.1)] border border-gray-100 text-[14px] transform hover:scale-110 transition-transform">${myReaction}</div>` : '';
        
        if (m.isPending) {
            if (m.status === 'sending') {
                statusHtml = `Sending... <i class="fa-solid fa-spinner fa-spin text-[8px]"></i>`;
                opacityClass = 'opacity-70';
            } else if (m.status === 'failed') {
                statusHtml = `<span class="text-red-300 font-bold">Failed</span> <button onclick="retryMsg('${m._id}')" class="text-white bg-red-500 hover:bg-red-600 px-1.5 py-0.5 rounded ml-1 transition">Retry <i class="fa-solid fa-rotate-right ml-0.5 text-[8px]"></i></button>`;
            }
        }

        return `<div class="flex ${isMe ? 'justify-end' : 'justify-start'} mb-2 group">${isMe && !m.isPending ? `<button onclick="deleteSingleMsg('${m._id}')" class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition text-[10px] mr-2"><i class="fa-solid fa-trash"></i></button>` : ''}<div class="relative ${bubbleClass} px-4 py-2 text-sm max-w-[80%] shadow-md ${opacityClass}" oncontextmenu="handleMsgLongPress(event, '${m._id}')">${content}<div class="text-[9px] opacity-70 text-right mt-1 font-mono flex items-center justify-end gap-1">${statusHtml}</div>${reactionBadge}</div></div>`;
    }).join('');
    
    if (isNearBottom || !window.chatScrolledOnce) {
        chatMsgs.scrollTop = chatMsgs.scrollHeight;
        window.chatScrolledOnce = true;
    }
}



async function clearChat() { openConfirmModal("Clear Chat?", "Are you sure?", async () => { await APIService.chat.clearChat(activeChatUser); loadMsgs(); }); }
async function deleteSingleMsg(id) { openConfirmModal("Delete?", "Delete message?", async () => { await APIService.chat.deleteMsg(id); loadMsgs(); }); }

function handleMsgLongPress(e, msgId) {
    e.preventDefault(); // Prevent standard right-click menu
    showReactionsModal(e, msgId);
}

function showReactionsModal(e, msgId) {
    if(navigator.vibrate) navigator.vibrate(50); // Haptic feedback on long press
    
    // Remove existing modal if any
    const existing = document.getElementById('chat-reaction-modal');
    if (existing) existing.remove();

    const emojis = ['❤️', '😂', '😮', '😢', '🔥', '👏'];
    const modal = document.createElement('div');
    modal.id = 'chat-reaction-modal';
    modal.className = 'fixed z-[9999] bg-white/95 backdrop-blur-xl rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-200/50 px-4 py-3 flex gap-4 transform -translate-x-1/2 -translate-y-full';
    
    let x = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : window.innerWidth/2);
    let y = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : window.innerHeight/2);
    
    // Keep within bounds
    x = Math.max(120, Math.min(x, window.innerWidth - 120));
    
    modal.style.left = x + 'px';
    modal.style.top = (y - 30) + 'px';
    modal.style.animation = 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    emojis.forEach(emo => {
        const span = document.createElement('span');
        span.innerText = emo;
        span.className = 'text-3xl cursor-pointer hover:scale-150 hover:-translate-y-2 transition-all duration-200 drop-shadow-sm';
        span.onclick = () => {
            reactToMsg(msgId, emo);
            modal.remove();
        };
        modal.appendChild(span);
    });
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        window.addEventListener('click', function closeMenu(ev) {
            if (!modal.contains(ev.target)) {
                modal.remove();
                window.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
}

function reactToMsg(msgId, emoji) {
    let reactions = JSON.parse(localStorage.getItem('chatReactions') || '{}');
    if (reactions[msgId] === emoji) {
        delete reactions[msgId]; // toggle off if same
        emoji = null; // null means removed
    } else {
        reactions[msgId] = emoji;
    }
    localStorage.setItem('chatReactions', JSON.stringify(reactions));
    loadMsgs(); // Re-render chat
    
    // Backend API Call
    if (APIService.chat.reactToMsg) {
        APIService.chat.reactToMsg(msgId, emoji).catch(e => console.log(e));
    }
}


async function renderReels(container) {
    try {
        // 🔥 OFFLINE/ONLINE SMART LOGIC FOR LOTTIE LOADER 🔥
    
        container.innerHTML = `
            <div id="reels-loader" class="h-screen w-full flex flex-col items-center justify-center bg-black absolute inset-0 z-50">
                <lottie-player 
                    src="https://aakash7911.github.io/cat_animation.json/" 
                    background="transparent" 
                    speed="1" 
                    style="width: 150px; height: 150px;" 
                    loop 
                    autoplay>
                </lottie-player>
                <p class="text-sm text-white/70 font-medium mt-2 animate-pulse">Loading Reels...</p>
            </div>
        `;

        // 🔥 YOUTUBE KO CONTROL KARNE KA SMART LOGIC (Sirf ek baar load hoga)
        if (!window.ytControllerAdded) {
            window.ytControllerAdded = true;
            window.ytClickTimers = {};
            window.ytPlayState = {}; // Track karega ki pause hai ya play
            window.ytMuteState = {}; // Track karega ki mute hai ya unmute

            window.handleYtAction = (e, id) => {
                const iframe = document.getElementById('yt-iframe-' + id);
                if (!iframe || !iframe.contentWindow) return;

                if (window.ytClickTimers[id]) {
                    // 🚀 DOUBLE CLICK: Video Play/Pause karne ke liye
                    clearTimeout(window.ytClickTimers[id]);
                    window.ytClickTimers[id] = null;
                    
                    window.ytPlayState[id] = !window.ytPlayState[id]; // Toggle state
                    const action = window.ytPlayState[id] ? 'pauseVideo' : 'playVideo';
                    iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: action, args: []}), '*');
                } else {
                    // 🚀 SINGLE CLICK: Audio Mute/Unmute karne ke liye
                    window.ytClickTimers[id] = setTimeout(() => {
                        window.ytClickTimers[id] = null;
                        
                        window.ytMuteState[id] = !window.ytMuteState[id];
                        const action = window.ytMuteState[id] ? 'mute' : 'unMute';
                        iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: action, args: []}), '*');
                        
                        // Mute/Unmute ka Icon screen par dikhane ke liye
                        const statDiv = document.getElementById('yt-mute-stat-' + id);
                        const icon = document.getElementById('yt-mute-icon-' + id);
                        if (statDiv && icon) {
                            icon.className = window.ytMuteState[id] ? "fa-solid fa-volume-xmark text-2xl" : "fa-solid fa-volume-high text-2xl";
                            statDiv.classList.remove('opacity-0');
                            setTimeout(() => statDiv.classList.add('opacity-0'), 1000);
                        }
                    }, 250); // 250ms ka timer taaki pata chale single click hai ya double
                }
            };

            window.addEventListener('message', (e) => {
                try {
                    let data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
                    if (data.event === 'infoDelivery' && data.info && data.info.playerState === 1) {
                        let iframes = document.querySelectorAll('.youtube-iframe');
                        iframes.forEach(ifr => {
                            if (ifr.contentWindow === e.source) {
                                ifr.classList.remove('opacity-0');
                                ifr.classList.add('opacity-100');
                            }
                        });
                    }
                    // Loop YouTube videos automatically when they end (playerState === 0)
                    if (data.event === 'infoDelivery' && data.info && data.info.playerState === 0) {
                        let iframes = document.querySelectorAll('.youtube-iframe');
                        iframes.forEach(ifr => {
                            if (ifr.contentWindow === e.source) {
                                ifr.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'seekTo', args: [0, true]}), '*');
                                ifr.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'playVideo', args: []}), '*');
                            }
                        });
                    }
                } catch(err) {}
            });
        }

        // Data aane ka wait karo (Tab tak billi khelti rahegi)
        const posts = await APIService.feed.getAll();
        let videoPosts = posts.filter(p => p.video || (p.image && p.image.match(/\.(mp4|mov|webm)$/i)) || p.category === 'youtube_reel');

        if(videoPosts.length === 0) {
            container.innerHTML = '<div class="h-screen flex items-center justify-center text-white bg-black">No Reels Found.</div>';
            return;
        }

        // 🔥 REELS KO RANDOM/SHUFFLE KARNE KA LOGIC
        videoPosts = videoPosts.sort(() => Math.random() - 0.5);

        // 🔥 IF OPENING A SHARED REEL, MOVE IT TO TOP 🔥
        if (window.targetReelToOpen) {
            const targetIndex = videoPosts.findIndex(p => p._id === window.targetReelToOpen);
            if (targetIndex !== -1) {
                const targetReel = videoPosts.splice(targetIndex, 1)[0];
                videoPosts.unshift(targetReel); // Put it at index 0
            }
            window.targetReelToOpen = null; // Clear it
        }

        const myId = localStorage.getItem("userId");

        // 🔥 Yahan par naya content aate hi loader automatic hat jayega (kyunki innerHTML overwrite ho jayega)
        container.innerHTML = `<div class="reels-wrapper">
            ${videoPosts.map((p, index) => {
                let videoUrl = p.video || p.image;
                const isLiked = p.likes?.includes(myId);
                const isFollowing = typeof myFollowing !== 'undefined' ? myFollowing.includes(p.userId?._id) : false;
                const isMe = p.userId?._id === myId;
                
                // YouTube reel pehchanne ka logic
                const isYouTube = p.category === 'youtube_reel' || (videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')));

                // 🔥 THUMBNAIL LOGIC 🔥
                let ytId = isYouTube ? videoUrl.match(/(?:embed\/|v=|youtu\.be\/|shorts\/)([^?&]+)/)?.[1] : null;
                let thumbStyle = ytId ? `style="background: url('https://img.youtube.com/vi/${ytId}/hqdefault.jpg') center/cover no-repeat;"` : "";
                
                // MP4/Cloudinary POSTER
                let posterUrl = p.image || ""; 
                if (isYouTube && ytId) {
                    posterUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                } else if (!isYouTube && videoUrl && videoUrl.includes('res.cloudinary.com/')) {
                    posterUrl = videoUrl.replace(/\.(mp4|webm|mov)$/i, '.jpg');
                }

                if (isYouTube && ytId) {
                    // Force the clean embed URL to avoid the giant Shorts logo and heavy page load
                    // Removed playlist and loop=1 to prevent the annoying Previous/Next buttons from showing on pause
                    videoUrl = `https://www.youtube.com/embed/${ytId}?enablejsapi=1&rel=0&controls=0&modestbranding=1&autoplay=0&playsinline=1&iv_load_policy=3&disablekb=1`;
                }

                return `
                <div class="reel-card" id="reel-${p._id}">
                    
                    ${isYouTube ? `
                        <div class="absolute inset-0 z-0 bg-black pointer-events-none flex items-center justify-center">
                            <div class="w-[95%] h-[85%] relative rounded-2xl overflow-hidden shadow-2xl bg-black" ${thumbStyle}>
                                <iframe 
                                    id="yt-iframe-${p._id}"
                                    class="youtube-iframe absolute left-0 w-full border-none pointer-events-none opacity-0 transition-opacity duration-500" 
                                    style="height: calc(100% + 140px); top: -70px; transform: scale(1.35);"
                                    onload="try{this.contentWindow.postMessage(JSON.stringify({event: 'listening'}), '*');}catch(e){}"
                                    data-src="${videoUrl}" 
                                    src="${index === 0 ? videoUrl.replace('autoplay=0', 'autoplay=1') : (index < 5 ? videoUrl.replace('autoplay=1', 'autoplay=0') : '')}" 
                                    allow="autoplay; encrypted-media"
                                    loading="eager"
                                    allowfullscreen>
                                </iframe>
                            </div>
                        </div>

                        <div id="yt-mute-stat-${p._id}" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white w-16 h-16 rounded-full flex items-center justify-center opacity-0 transition-opacity z-30 pointer-events-none">
                            <i class="fa-solid fa-volume-high text-2xl" id="yt-mute-icon-${p._id}"></i>
                        </div>

                        <div class="absolute inset-0 z-10 bg-transparent cursor-pointer" onclick="handleYtAction(event, '${p._id}')"></div>
                    ` : `
                        <div class="absolute inset-0 flex items-center justify-center z-0 bg-black">
                            <div class="w-[95%] h-[85%] relative rounded-2xl overflow-hidden shadow-2xl bg-black">
                                <video loop muted playsinline webkit-playsinline preload="auto" poster="${posterUrl}"
                                    class="reel-video absolute inset-0 w-full h-full object-cover z-20" 
                                    id="vid-${p._id}"
                                    ontimeupdate="typeof updateReelProgress === 'function' ? updateReelProgress('${p._id}') : null"
                                    onclick="typeof handleReelClick === 'function' ? handleReelClick(event, '${p._id}') : null">
                                    <source data-src="${videoUrl}" src="${index < 5 ? videoUrl : ''}" type="video/mp4">
                                </video>
                            </div>
                        </div>

                        <div id="mute-stat-${p._id}" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white w-16 h-16 rounded-full flex items-center justify-center opacity-0 transition-opacity z-30 pointer-events-none">
                            <i class="fa-solid fa-volume-high text-2xl" id="mute-icon-center-${p._id}"></i>
                        </div>

                        <div class="absolute bottom-24 right-4 z-30 bg-black/20 p-2 rounded-full text-white pointer-events-none" id="mini-mute-${p._id}">
                            <i class="fa-solid fa-volume-high text-xs"></i>
                        </div>
                    `}
                    
                    <div class="reel-actions-overlay" style="z-index: 20;">
                        <div class="flex flex-col items-center mb-4" onclick="toggleReelLike('${p._id}')">
                            <i class="fa-solid fa-heart text-3xl transition-transform active:scale-150 ${isLiked ? 'text-red-500' : 'text-white'}" id="rlike-icon-${p._id}"></i>
                            <span class="text-xs font-bold shadow-sm" id="rlike-cnt-${p._id}">${p.likes?.length || 0}</span>
                        </div>
                        
                        <div class="flex flex-col items-center mb-4" onclick="openReelComments('${p._id}')">
                            <i class="fa-solid fa-comment text-3xl text-white"></i>
                            <span class="text-xs font-bold shadow-sm" id="rcmt-cnt-${p._id}">${p.comments?.length || 0}</span>
                        </div>

                        <div class="flex flex-col items-center mb-4" onclick="reportUser('${p.userId?._id}', '${p.userId?.username}')">
                            <i class="fa-solid fa-flag text-2xl text-white/80"></i>
                        </div>

                        <!-- Reel Share Button -->
                        <div class="flex flex-col items-center mb-4" onclick="openReelShareModal('${p._id}', '${posterUrl}', '${videoUrl}', ${isYouTube})">
                            <i class="fa-solid fa-paper-plane text-2xl text-white transition-transform active:-translate-y-2 active:scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"></i>
                        </div>

                        <div class="flex flex-col items-center" onclick="${isYouTube ? `alert('YouTube reels direct download nahi ho sakti.')` : `downloadReelWithProgress('${videoUrl}', '${p._id}')`}">
                            <i class="fa-solid fa-download text-2xl ${isYouTube ? 'text-white/50' : 'text-white'}" id="dl-icon-${p._id}"></i>
                            <span class="text-[9px] font-bold hidden" id="dl-perc-${p._id}">0%</span>
                        </div>
                    </div>

                    <div class="reel-info-overlay" style="z-index: 20;">
                        <div class="flex items-center gap-2 mb-2">
                            <img src="${p.userId?.photo || 'https://placehold.co/40'}" 
                                class="w-10 h-10 rounded-full border-2 border-white object-cover cursor-pointer" 
                                onclick="viewUserProfile('${p.userId?._id}')">
                            <div class="flex flex-col">
                                <span class="font-bold text-white shadow-sm cursor-pointer" onclick="viewUserProfile('${p.userId?._id}')">@${p.userId?.username || 'user'}</span>
                                ${!isMe ? `
                                <button id="rfollow-${p._id}" onclick="handleReelFollow('${p.userId?._id}', '${p._id}')" 
                                    class="text-[11px] font-black uppercase text-left transition-all ${isFollowing ? 'text-gray-300' : 'text-purple-400'}">
                                    ${isFollowing ? 'Following' : 'Follow'}
                                </button>` : ''}
                            </div>
                        </div>
                        <p class="text-sm text-white shadow-sm line-clamp-2">${p.content || ''}</p>
                    </div>

                    ${!isYouTube ? `
                    <div class="absolute bottom-0 left-0 w-full h-1 bg-gray-800/50 z-40 cursor-pointer group" onclick="seekReel(event, '${p._id}')">
                        <div id="prog-bar-${p._id}" class="h-full bg-white w-0 transition-all duration-100 relative">
                            <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
                        </div>
                    </div>
                    ` : ''}
                </div>`;
            }).join('')}
        </div>`;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const v = entry.target.querySelector('video');
                const iframe = entry.target.querySelector('.youtube-iframe');

                if (entry.isIntersecting) {
                    // 🔥 STRICT LOGIC: Jo screen par nahi hai use force pause karo (Ek sath na chalein)
                    document.querySelectorAll('.reel-video').forEach(vid => {
                        if (vid !== v) vid.pause();
                    });
                    document.querySelectorAll('.youtube-iframe').forEach(ifr => {
                        if (ifr !== iframe && ifr.getAttribute('src')) {
                            ifr.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'pauseVideo', args: []}), '*');
                        }
                    });

                    // 🔥 PLAY CURRENT VIDEO
                    if (v) {
                        v.muted = false; 
                        v.play().catch(() => { v.muted = true; v.play(); }); 
                        if(typeof updateMuteUI === 'function') updateMuteUI(v.id.split('-')[1], v.muted);
                        
                        // AUTO REPLAY LOGIC
                        v.onended = () => { v.play(); };
                    }
                    if (iframe) {
                        const id = iframe.id.split('-')[2];
                        if(window.ytPlayState) window.ytPlayState[id] = false; 
                        if(window.ytMuteState) window.ytMuteState[id] = false;
                        
                        if (!iframe.getAttribute('src')) {
                            iframe.setAttribute('src', iframe.getAttribute('data-src').replace('autoplay=0', 'autoplay=1')); 
                        } else {
                            iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'playVideo', args: []}), '*');
                        }
                    }

                    // 🔥 BACKGROUND PUSH PRELOAD (NEXT 5 REELS) 🔥
                    let nextCard = entry.target.nextElementSibling;
                    for (let i = 0; i < 5 && nextCard; i++) {
                        // YouTube Preload in Push condition (paused/muted)
                        let nextIframe = nextCard.querySelector('.youtube-iframe');
                        if (nextIframe && !nextIframe.getAttribute('src')) {
                            nextIframe.setAttribute('src', nextIframe.getAttribute('data-src').replace('autoplay=1', 'autoplay=0'));
                        }
                        
                        // MP4 Preload in Push condition
                        let nextVid = nextCard.querySelector('.reel-video');
                        if (nextVid) {
                            let nextSource = nextVid.querySelector('source');
                            if (nextSource && !nextSource.getAttribute('src')) {
                                nextSource.setAttribute('src', nextSource.getAttribute('data-src'));
                                nextVid.load(); // Browser ko URL fetch karne ki command (Bina play kiye)
                            }
                        }
                        nextCard = nextCard.nextElementSibling;
                    }

                } else {
                    if (v) {
                        v.pause();
                    }
                    if (iframe) {
                        if (iframe.getAttribute('src')) {
                            iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'pauseVideo', args: []}), '*');
                        }
                    }
                }
            });
        }, { threshold: 0.7 }); 

        document.querySelectorAll('.reel-card').forEach(card => observer.observe(card));

    } catch(e) { 
        console.error(e);
        container.innerHTML = "<div class='text-white text-center p-20'>Error loading reels. Please check your internet.</div>"; 
    }
}

function openReelComments(postId) {
    document.getElementById('reelsCommentModal').classList.remove('hidden');
    document.getElementById('reel-cmt-btn').setAttribute('onclick', `postReelComment('${postId}')`);
    document.getElementById('reel-cmts-list').innerHTML = `<div class="flex justify-center py-10"><i class="fa-solid fa-spinner fa-spin text-purple-500 text-2xl"></i></div>`;
    loadReelComments(postId);
}

function closeReelComments() {
    document.getElementById('reelsCommentModal').classList.add('hidden');
}

async function loadReelComments(postId) {
    const list = document.getElementById('reel-cmts-list');
    try {
        const posts = await APIService.feed.getAll();
        const p = posts.find(item => item._id === postId);
        if(!p.comments || p.comments.length === 0) {
            list.innerHTML = `<p class="text-center text-gray-400 py-10">No comments yet.</p>`;
            return;
        }

        const myId = localStorage.getItem("userId");
       
        const isMePost = p.userId?._id === myId || p.userId === myId; 

        list.innerHTML = p.comments.map(c => {
           
            const canDelete = isMePost || (c.userId && (c.userId._id === myId || c.userId === myId));

            return `
            <div class="flex gap-3 group" id="comment-item-${c._id}">
                <img src="${c.userId?.photo || 'https://placehold.co/30'}" class="w-8 h-8 rounded-full object-cover">
                <div class="flex-1 border-b border-gray-100 pb-2">
                    <div class="flex justify-between items-center mb-1">
                        <p class="text-xs font-bold text-gray-800">@${c.userId?.username || c.userName || 'user'}</p>
                        ${canDelete ? `<button onclick="deleteComment('${postId}', '${c._id}')" class="text-gray-400 hover:text-red-500 text-[10px] bg-red-50 px-2 py-1 rounded-full"><i class="fa-solid fa-trash"></i></button>` : ''}
                    </div>
                    <p class="text-sm text-gray-600">${c.text}</p>
                </div>
            </div>`;
        }).reverse().join('');
    } catch(e) { list.innerHTML = "Error loading."; }
}

async function postReelComment(postId) {
    window.trackInteraction(postId);
    const inp = document.getElementById('reel-cmt-input');
    if(!inp.value) return;
    try {
        await APIService.feed.comment(postId, inp.value);
        inp.value = "";
        loadReelComments(postId); 
        const cnt = document.getElementById(`rcmt-cnt-${postId}`);
        if(cnt) cnt.innerText = parseInt(cnt.innerText) + 1;
    } catch(e) { showToast("Comment failed"); }
}


async function handleReelFollow(userId, postId) {
    const btn = document.getElementById(`rfollow-${postId}`);
    const originalText = btn.innerText;
    const isFollowingNow = originalText === 'Follow';
    btn.innerText = isFollowingNow ? 'Following' : 'Follow';
    btn.className = `text-[11px] font-black uppercase text-left transition-all ${isFollowingNow ? 'text-gray-300' : 'text-purple-400'}`;

    try {
        const res = await APIService.user.follow(userId);
        if (res.status === 'followed') {
            if(!myFollowing.includes(userId)) myFollowing.push(userId);
        } else {
            myFollowing = myFollowing.filter(id => id !== userId);
        }
    } catch (e) {
        btn.innerText = originalText;
        btn.className = `text-[11px] font-black uppercase text-left transition-all ${originalText === 'Following' ? 'text-gray-300' : 'text-purple-400'}`;
        showToast("Error updating follow");
    }
}


async function toggleReelLike(postId) {
    window.trackInteraction(postId);
    const icon = document.getElementById(`rlike-icon-${postId}`);
    const countSpan = document.getElementById(`rlike-cnt-${postId}`);
    let count = parseInt(countSpan.innerText);

    if (icon.classList.contains('text-red-500')) {
        icon.classList.replace('text-red-500', 'text-white');
        countSpan.innerText = Math.max(0, count - 1);
    } else {
        icon.classList.replace('text-white', 'text-red-500');
        icon.classList.add('scale-150');
        setTimeout(() => icon.classList.remove('scale-150'), 200);
        countSpan.innerText = count + 1;
    }

    try {
        await APIService.feed.like(postId);
    } catch (e) {
        console.error("Like failed", e);
    }
}

async function downloadReelWithProgress(url, postId) {
    const icon = document.getElementById(`dl-icon-${postId}`);
    const percText = document.getElementById(`dl-perc-${postId}`);
    icon.classList.add('hidden');
    percText.classList.remove('hidden');

    try {
        const response = await axios({
            url: url, method: 'GET', responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
                let percent = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
                percText.innerText = percent + "%";
            }
        });
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', `Zobbly_Reel_${postId}.mp4`);
        document.body.appendChild(link);
        link.click();
        showToast("Saved to Gallery!");
    } catch (e) { showToast("Download failed"); }
    finally { icon.classList.remove('hidden'); percText.classList.add('hidden'); }
}


let reelClickTimer = null;
function handleReelClick(e, postId) {
    const v = document.getElementById(`vid-${postId}`);
    if (reelClickTimer == null) {
        reelClickTimer = setTimeout(() => {
            reelClickTimer = null;
            v.muted = !v.muted;
            updateMuteUI(postId, v.muted);
        }, 300);
    } else {
        clearTimeout(reelClickTimer);
        reelClickTimer = null;
        if (v.paused) v.play(); else v.pause();
    }
}

function updateMuteUI(postId, isMuted) {
    const statusBox = document.getElementById(`mute-stat-${postId}`);
    const statusIcon = document.getElementById(`mute-icon-center-${postId}`);
    const miniMute = document.getElementById(`mini-mute-${postId}`);
    statusIcon.className = isMuted ? "fa-solid fa-volume-xmark text-2xl" : "fa-solid fa-volume-high text-2xl";
    miniMute.innerHTML = isMuted ? '<i class="fa-solid fa-volume-xmark text-xs"></i>' : '<i class="fa-solid fa-volume-high text-xs"></i>';
    statusBox.classList.remove('opacity-0');
    setTimeout(() => statusBox.classList.add('opacity-0'), 800);
}

function updateReelProgress(postId) {
    const v = document.getElementById(`vid-${postId}`);
    const bar = document.getElementById(`prog-bar-${postId}`);
    if (v.duration) {
        const perc = (v.currentTime / v.duration) * 100;
        bar.style.width = perc + "%";
    }
}

function seekReel(e, postId) {
    const v = document.getElementById(`vid-${postId}`);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    v.currentTime = (x / rect.width) * v.duration;
}

async function downloadReelWithProgress(url, postId) {
    const icon = document.getElementById(`dl-icon-${postId}`);
    const percText = document.getElementById(`dl-perc-${postId}`);
    
    if (!icon || !percText) return;

    icon.classList.add('hidden');
    percText.classList.remove('hidden');
    percText.innerText = "0%";

    try {
        const secureUrl = url.replace("http://", "https://");

        const response = await axios({
            url: secureUrl,
            method: 'GET',
            responseType: 'blob', 
            onDownloadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    let percent = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
                    percText.innerText = percent + "%";
                } else {
                    percText.innerText = "...";
                }
            }
        });

        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', `Zobbly_Reel_${postId}.mp4`);
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        
        showToast("Video Saved!");
    } catch (e) {
        console.error("Download Error Details:", e);
        showToast("Download failed. Opening in new tab...");
        window.open(url, '_blank');
    } finally {
        icon.classList.remove('hidden');
        percText.classList.add('hidden');
    }
}

function openEditProfile() {
    document.getElementById('editProfileModal').classList.remove('hidden');
    const currentLang = localStorage.getItem('appLang') || 'en';

    
    const langOptions = {
        'en': {t: 'English', i: 'gb'}, 'hi': {t: 'Hindi (हिंदी)', i: 'in'}, 'es': {t: 'Spanish (Español)', i: 'es'},
        'fr': {t: 'French (Français)', i: 'fr'}, 'de': {t: 'German (Deutsch)', i: 'de'}, 'zh': {t: 'Chinese (中文)', i: 'cn'},
        'ja': {t: 'Japanese (日本語)', i: 'jp'}, 'ru': {t: 'Russian (Русский)', i: 'ru'}, 'pt': {t: 'Portuguese (Português)', i: 'pt'},
        'ar': {t: 'Arabic (العربية)', i: 'sa'}, 'it': {t: 'Italian (Italiano)', i: 'it'}, 'ko': {t: 'Korean (한국어)', i: 'kr'},
        'tr': {t: 'Turkish (Türkçe)', i: 'tr'}, 'nl': {t: 'Dutch (Nederlands)', i: 'nl'}, 'pl': {t: 'Polish (Polski)', i: 'pl'},
        'id': {t: 'Indonesian (Bahasa)', i: 'id'}, 'vi': {t: 'Vietnamese (Tiếng Việt)', i: 'vn'}, 'th': {t: 'Thai (ไทย)', i: 'th'},
        'bn': {t: 'Bengali (বাংলা)', i: 'bd'}, 'pa': {t: 'Punjabi (ਪੰਜਾਬੀ)', i: 'in'}, 'ur': {t: 'Urdu (اردو)', i: 'pk'}
    };
    
    const data = langOptions[currentLang] || langOptions['en'];

    
    document.getElementById('editName').value = localStorage.getItem("userName") || "";
    document.getElementById('editLang').value = currentLang;
    document.getElementById('lang-selected-text').innerHTML = `<img src="https://flagcdn.com/w20/${data.i}.png" class="w-5 h-5 rounded-full shadow-sm"> ${data.t}`;

    
    document.querySelectorAll('#lang-dropdown-menu .dropdown-option').forEach(el => {
        el.classList.remove('selected');
        if(el.getAttribute('onclick').includes(`'${currentLang}'`)) el.classList.add('selected');
    });
}


async function saveProfile() {
    const selectedLang = document.getElementById('editLang').value;
    const newName = document.getElementById('editName').value;
    const newHeadline = document.getElementById('editHeadline').value;

    localStorage.setItem('appLang', selectedLang);
    
    try {
        await APIService.user.update(newName, newHeadline);
        localStorage.setItem("userName", newName);
        showToast("Profile Updated!");
        location.reload(); 
    } catch(e) {
        showToast("Update failed!");
    }
}

let currentUploadTask = null;
let currentFilter = 'none';



function applyFilter(filter) {
    currentFilter = filter;
    const media = document.getElementById('previewMedia');
    if(media) media.style.filter = filter;
}

function updateOverlayText(val) {
    document.getElementById('overlayTextDisplay').innerText = val;
}

function cancelPostEditor() {
    document.getElementById('postEditorModal').classList.add('hidden');
    document.getElementById('postModal').classList.remove('hidden');
}

async function finalSubmitPost() {
    const fd = new FormData();
    const content = document.getElementById('postContent').value;
    const overlayText = document.getElementById('overlayTextInput').value;
    const file = document.getElementById('postImage').files[0];

    fd.append('content', (overlayText ? overlayText + "\n" : "") + content);
    fd.append('postImage', file);

    document.getElementById('postEditorModal').classList.add('hidden');
    const progressModal = document.getElementById('uploadProgressModal');
    progressModal.classList.remove('hidden');

    currentUploadTask = axios.CancelToken.source();

    try {
        const res = await axios.post(`${API_BASE}/api/posts/create`, fd, {
            headers: { 'x-auth-token': localStorage.getItem("token") },
            cancelToken: currentUploadTask.token,
            onUploadProgress: (p) => {
                const perc = Math.round((p.loaded * 100) / p.total);
                document.getElementById('uploadPercentage').innerText = perc + "%";
            }
        });

        showToast("Post Uploaded!");
        resetPostForm();
        renderView('feed');
    } catch (err) {
        if (axios.isCancel(err)) showToast("Upload Cancelled");
        else showToast("Post Failed");
    } finally {
        progressModal.classList.add('hidden');
    }
}

function abortUpload() {
    if(currentUploadTask) currentUploadTask.cancel();
}

function resetPostForm() {
    document.getElementById('postContent').value = "";
    document.getElementById('postImage').value = "";
    document.getElementById('overlayTextInput').value = "";
    document.getElementById('overlayTextDisplay').innerText = "";
}



function toggleThemeMenu() {
    const menu = document.getElementById('theme-options');
    if (menu) {
        menu.classList.toggle('hidden');
    } else {
        console.error("Error: 'theme-options' ID वाला एलिमेंट नहीं मिला!");
    }
}


function changeTheme(themeName) {
    const body = document.body;
  
    const html = document.documentElement; 
    const content = document.getElementById('main-content');

  
    body.classList.remove('theme-dark', 'theme-pink', 'theme-red');
    body.style.background = '';
    body.style.backgroundColor = '';
    body.style.backgroundImage = '';
    
    html.style.background = '';
    html.style.backgroundColor = '';
    html.style.backgroundImage = '';

    if (content) {
        content.style.background = '';
        content.style.backgroundColor = '';
    }

    
    if (themeName === 'default') {
       
        console.log("Applied Default Theme (Gradient)");
    } 
    else {
       
        body.classList.add(`theme-${themeName}`);
        body.style.backgroundImage = 'none';
        html.style.backgroundImage = 'none';
        
       
        let newColor = '';
        if (themeName === 'dark') newColor = '#000000'; 
        else if (themeName === 'pink') newColor = '#ffe4e1';
        else if (themeName === 'red') newColor = '#fff5f5';

      
        if (newColor) {
            body.style.backgroundColor = newColor;
            html.style.backgroundColor = newColor;
            if(content) content.style.backgroundColor = newColor;
        }
    }

   
    localStorage.setItem('selectedTheme', themeName);
}


function applySavedTheme() {
    const saved = localStorage.getItem('selectedTheme');
    if (saved) {
        changeTheme(saved);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    applySavedTheme();
});



const SECRET_KEY = "Zobbly_Secure_Lock_99";


function encrypt(data) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
}


function decrypt(cipher) {
    try {
        const bytes = CryptoJS.AES.decrypt(cipher, SECRET_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (e) { return null; }
}

function fileToBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

async function getLocalVaultData(email) {
    try {
        const rawData = await localforage.getItem(`vault_data_${email}`);
        if (!rawData) return {};
       
        return decrypt(rawData) || JSON.parse(rawData);
    } catch (e) {
        console.error("Error loading local vault:", e);
        return {};
    }
}

async function renderDocuments() {
    const c = document.getElementById('main-content');
    c.innerHTML = '<div class="text-center mt-20"><i class="fa-solid fa-spinner fa-spin text-4xl text-purple-600"></i><p class="mt-2 text-sm text-gray-500">Unlocking Local Vault...</p></div>';

    try {
        const loggedInEmail = localStorage.getItem('userEmail'); 
        if (!loggedInEmail) {
            c.innerHTML = '<div class="text-center mt-20 text-red-500 font-bold">Please Login First!</div>';
            return;
        }

     
        const savedData = await getLocalVaultData(loggedInEmail);

        const html = `
        <div class="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 py-3 flex items-center justify-between">
            <button onclick="renderView('feed')" class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700">
                <i class="fa-solid fa-arrow-left text-lg"></i>
            </button>
            <h1 class="text-lg font-bold text-gray-800 tracking-wide">My Secure Vault 🔒</h1>
            <div class="w-10"></div>
        </div>

        <div style="height: 70px;"></div>

        <div class="p-4 pb-24">
            <p class="text-xs text-center text-green-600 mb-4 font-bold"><i class="fa-solid fa-shield-halved"></i> Data is stored offline on this device.</p>
            
            <div class="glass-card p-5 mb-6 shadow-sm border border-gray-100 rounded-2xl bg-white">
                <h3 class="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <i class="fa-solid fa-user-gear text-purple-600"></i> Identity Details
                </h3>
                <div class="space-y-4">
                    <input type="text" id="vault-name" value="${savedData.fullName || ''}" class="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none focus:ring-2 ring-purple-500/20" placeholder="Full Name">
                    
                    <div class="grid grid-cols-2 gap-3">
                        <input type="date" id="vault-dob" value="${savedData.dob || ''}" class="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none">
                        <select id="vault-gender" class="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none">
                            <option value="">Gender</option>
                            <option value="Male" ${savedData.gender === 'Male' ? 'selected' : ''}>Male</option>
                            <option value="Female" ${savedData.gender === 'Female' ? 'selected' : ''}>Female</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <input type="text" id="vault-pan" value="${savedData.panNo || ''}" class="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none uppercase" placeholder="PAN Number">
                        <input type="number" id="vault-aadhar" value="${savedData.aadharNo || ''}" class="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none" placeholder="Aadhar No">
                    </div>

                    <input type="text" id="vault-mark" value="${savedData.birthMark || ''}" class="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none" placeholder="Visible Birth Mark">
                    
                    <textarea id="vault-address" class="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none h-20" placeholder="Full Permanent Address">${savedData.address || ''}</textarea>
                </div>
            </div>

            <div class="glass-card p-5 mb-6 shadow-sm border border-gray-100 rounded-2xl bg-white">
                <h3 class="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <i class="fa-solid fa-file-invoice text-purple-600"></i> My Documents
                </h3>
                <div class="space-y-8">
                    ${renderDocumentItem('Passport Photo', 'doc-photo', savedData.photoImg)}
                    ${renderDocumentItem('Aadhar Card', 'doc-aadhar', savedData.aadharImg)}
                    ${renderDocumentItem('PAN Card', 'doc-pan', savedData.panImg)}
                    ${renderDocumentItem('10th Marksheet', 'doc-10th', savedData.mark10Img)}
                    ${renderDocumentItem('12th Marksheet', 'doc-12th', savedData.mark12Img)}
                    ${renderDocumentItem('Caste Certificate', 'doc-caste', savedData.casteImg)}
                </div>
            </div>

            <button onclick="saveVaultLocally()" id="save-btn" class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition flex justify-center items-center gap-2">
                <i class="fa-solid fa-hard-drive"></i> Save Securely to Phone
            </button>
        </div>`;

        c.innerHTML = html;
    } catch(e) { 
        console.error(e); 
        c.innerHTML = '<div class="text-center mt-20 text-red-500 font-bold">Error loading vault data.</div>';
    }
}


function renderDocumentItem(label, id, base64) {
    return `
    <div class="relative">
        <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">${label}</label>
        <div class="mt-2 p-3 border rounded-2xl bg-gray-50 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-white rounded-lg border flex items-center justify-center overflow-hidden">
                    ${base64 ? `<img src="${base64}" class="w-full h-full object-cover">` : '<i class="fa-solid fa-image text-gray-300"></i>'}
                </div>
                <div>
                    <input type="file" id="${id}" accept="image/*" class="hidden" onchange="previewLocalFile(this, '${id}-preview')">
                    <button onclick="document.getElementById('${id}').click()" class="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg">
                        ${base64 ? 'Change File' : 'Choose File'}
                    </button>
                </div>
            </div>
            
            <div class="flex gap-2">
                ${base64 ? `
                    <button onclick="downloadVaultFile('${base64}', '${label}')" class="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full">
                        <i class="fa-solid fa-download text-sm"></i>
                    </button>
                    <button onclick="deleteVaultFile('${id}')" class="w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 rounded-full">
                        <i class="fa-solid fa-trash-can text-sm"></i>
                    </button>
                ` : ''}
            </div>
        </div>
        <div id="${id}-preview" class="hidden mt-2 text-center text-[10px] text-green-600">File Selected (Click Save) ✅</div>
    </div>`;
}


function previewLocalFile(input, previewId) {
    if (input.files && input.files[0]) {
        document.getElementById(previewId).classList.remove('hidden');
    }
}

function downloadVaultFile(base64, name) {
    const link = document.createElement('a');
    link.href = base64;
    link.download = `Zobbly_${name.replace(/\s+/g, '_')}.png`;
    link.click();
}

function deleteVaultFile(keyId) {
    if(confirm("Delete this document from phone memory? Remember to click 'Save' below.")) {
        alert("File flagged for removal. Click 'Save' to finalize.");
        document.getElementById(keyId).value = "";
       
    }
}

    async function saveVaultLocally() {
    const loggedInEmail = localStorage.getItem('userEmail');
    if(!loggedInEmail) return;

    const btn = document.getElementById('save-btn');
    const originalBtnText = btn.innerHTML; 
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Securing to Device...';

    try {
       
        if (typeof localforage === 'undefined') {
            throw new Error("localforage library load nahi hui! Kripya <head> mein script tag check karein.");
        }

        const oldData = await getLocalVaultData(loggedInEmail);

        const getImg = async (id, oldImg) => {
            const el = document.getElementById(id);
          
            if(el && el.files && el.files[0]) {
                return await fileToBase64(el.files[0]);
            }
            return oldImg;
        };

        const dataToSave = {
            fullName: document.getElementById('vault-name')?.value || "",
            dob: document.getElementById('vault-dob')?.value || "",
            gender: document.getElementById('vault-gender')?.value || "",
            panNo: document.getElementById('vault-pan')?.value || "",
            aadharNo: document.getElementById('vault-aadhar')?.value || "",
            birthMark: document.getElementById('vault-mark')?.value || "",
            address: document.getElementById('vault-address')?.value || "",
            
         
            photoImg: await getImg('doc-photo', oldData.photoImg || ''),
            aadharImg: await getImg('doc-aadhar', oldData.aadharImg || ''),
            panImg: await getImg('doc-pan', oldData.panImg || ''),
            mark10Img: await getImg('doc-10th', oldData.mark10Img || ''),
            mark12Img: await getImg('doc-12th', oldData.mark12Img || ''),
            casteImg: await getImg('doc-caste', oldData.casteImg || ''),
            lastUpdated: new Date().toLocaleString()
        };

       
        const encryptedData = encrypt(dataToSave);
        
      
        await localforage.setItem(`vault_data_${loggedInEmail}`, encryptedData);

       
        if(window.AndroidBridge && typeof window.AndroidBridge.saveToAndroid === 'function') {
            try {
                window.AndroidBridge.saveToAndroid(encryptedData);
            } catch (bridgeErr) {
                console.log("Android Bridge Error (Ignore if testing in browser):", bridgeErr);
            }
        }

        alert("✅ Vault Saved 100% Offline to your Phone!");
        renderDocuments(); 
        
    } catch (error) {
       
        console.error("Save Error:", error);
        alert("❌ Data save karne mein error aayi: " + error.message);
        btn.innerHTML = originalBtnText; 
    }
}

let lastScrollY = 0;
document.getElementById('app-screen').addEventListener('scroll', (e) => {
    if (!document.body.classList.contains('feed-mode')) return;
    const currentScrollY = e.target.scrollTop;
    const mainHeader = document.getElementById('main-app-header');
    const feedTopBar = document.getElementById('feed-top-bar');
    
    if (currentScrollY > 60 && currentScrollY > lastScrollY) {
       
        if (mainHeader) mainHeader.style.transform = 'translateY(-100%)';
        if (feedTopBar) feedTopBar.style.transform = 'translateY(-150%)';
    } else {
      
        if (mainHeader) mainHeader.style.transform = 'translateY(0)';
        if (feedTopBar) feedTopBar.style.transform = 'translateY(0)';
    }
    lastScrollY = currentScrollY;
}, { passive: true });



let backPressCount = 0;


window.history.pushState({ page: 'zobbly-main' }, null, window.location.href);
window.addEventListener('popstate', function (event) {
   
    const fullChat = document.getElementById('full-chat-view');
    if (fullChat && fullChat.classList.contains('active')) {
        closeFullChat();
        window.history.pushState({ page: 'zobbly-main' }, null, window.location.href); 
        return;
    }

    const modals = [
        document.getElementById('genericModal'),
        document.getElementById('postModal'),
        document.getElementById('editProfileModal'),
        document.getElementById('postEditorModal'),
        document.getElementById('universalConfirmModal')
    ];
    
    let modalClosed = false;
    for (let modal of modals) {
        if (modal && !modal.classList.contains('hidden') && modal.style.display !== 'none') {
            modal.classList.add('hidden');
            modal.style.display = '';
            modalClosed = true;
        }
    }
    
    if (modalClosed) {
        window.history.pushState({ page: 'zobbly-main' }, null, window.location.href);
        return;
    }

    
    const sidePanel = document.getElementById('side-panel');
    if (sidePanel && sidePanel.classList.contains('open')) {
        toggleSidePanel();
        window.history.pushState({ page: 'zobbly-main' }, null, window.location.href);
        return;
    }

   
    const feedBtn = document.getElementById('nav-feed');
    if (feedBtn && !feedBtn.classList.contains('nav-active')) {
        renderView('feed');
        window.history.pushState({ page: 'zobbly-main' }, null, window.location.href);
        return;
    }

    if (backPressCount === 0) {
        showToast("Press back again to exit");
        backPressCount++;
         window.history.pushState({ page: 'zobbly-main' }, null, window.location.href);
        
      
        setTimeout(() => {
            backPressCount = 0; 
        }, 2000);
    } else {
      
        window.history.back();
    }
});

setInterval(() => loadConversations(true), 5000);

// --- REEL SHARE LOGIC ---
let currentShareReel = null;
let shareUsersList = [];
let selectedShareUsers = new Set();
let shareFreqMap = {};

async function openReelShareModal(reelId, poster, videoUrl, isYouTube) {
    currentShareReel = { id: reelId, poster, videoUrl, isYouTube };
    selectedShareUsers.clear();
    updateShareCountBadge();
    document.getElementById('share-search-input').value = '';
    document.getElementById('share-search-results').classList.add('hidden');
    document.getElementById('reelsShareModal').classList.remove('hidden');

    try {
        // Fetch users from conversations
        let users = await APIService.chat.getConversations();
        const myId = localStorage.getItem("userId");
        shareUsersList = users.filter(u => u._id !== myId);
        
        // Fetch share frequency from backend API instead of local storage
        try {
            const freqRes = await APIService.user.getShareFreq();
            if(freqRes.success && freqRes.data) {
                shareFreqMap = freqRes.data;
            }
        } catch(e) {
            console.log("Fallback to local storage for share freq");
            shareFreqMap = JSON.parse(localStorage.getItem('reelShareFreq') || '{}');
        }
        
        shareUsersList.sort((a, b) => {
            const freqA = shareFreqMap[a._id] || 0;
            const freqB = shareFreqMap[b._id] || 0;
            return freqB - freqA;
        });

        renderShareCircle();
    } catch(e) {}
}

function closeReelShare() {
    document.getElementById('reelsShareModal').classList.add('hidden');
}

function renderShareCircle() {
    const container = document.getElementById('share-circle-container');
    container.innerHTML = '';
    
    const topUsers = shareUsersList.slice(0, 5);
    const outerUsers = shareUsersList.slice(5, 13);
    
    const radiusIn = 65; 
    const radiusOut = 140; 

    const renderNode = (u, radius, sizeClass, index, total) => {
        const angle = (index / total) * (2 * Math.PI) - Math.PI / 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        const isSelected = selectedShareUsers.has(u._id);
        const ringClass = isSelected ? 'border-4 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.8)]' : 'border border-white/30';
        const checkHtml = isSelected ? `<div class="absolute -bottom-1 -right-1 bg-pink-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-[10px] border-2 border-black z-10"><i class="fa-solid fa-check"></i></div>` : '';

        return `<div onclick="toggleShareUser('${u._id}')" class="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer hover:scale-110 active:scale-95 z-20" style="left: calc(50% + ${x}px); top: calc(50% + ${y}px);">
            <div class="relative rounded-full ${sizeClass} ${ringClass} transition-all duration-300 bg-black">
                <img src="${u.photo || 'https://placehold.co/40'}" class="w-full h-full rounded-full object-cover">
                ${checkHtml}
            </div>
            <div class="text-[9px] text-white/90 font-bold text-center mt-1 truncate w-14 absolute left-1/2 -translate-x-1/2 bg-black/60 px-1.5 py-0.5 rounded-full backdrop-blur-sm shadow-md">${u.name.split(' ')[0]}</div>
        </div>`;
    };

    let html = '';
    topUsers.forEach((u, i) => html += renderNode(u, radiusIn, 'w-14 h-14', i, topUsers.length));
    outerUsers.forEach((u, i) => html += renderNode(u, radiusOut, 'w-10 h-10', i, outerUsers.length));

    container.innerHTML = html;
}

function toggleShareUser(id) {
    if (selectedShareUsers.has(id)) selectedShareUsers.delete(id);
    else selectedShareUsers.add(id);
    
    renderShareCircle();
    updateShareCountBadge();
    
    // Update search results UI if open
    const q = document.getElementById('share-search-input').value;
    if(q.length > 0) filterShareUsers();
}

function updateShareCountBadge() {
    const badge = document.getElementById('share-count-badge');
    const btn = document.getElementById('send-shared-reel-btn');
    badge.innerText = selectedShareUsers.size;
    
    if (selectedShareUsers.size > 0) {
        btn.classList.remove('hidden');
        btn.classList.add('animate-pop-view');
    } else {
        btn.classList.add('hidden');
        btn.classList.remove('animate-pop-view');
    }
}

let shareSearchTimeout = null;
let currentShareSearchQuery = '';

async function filterShareUsers() {
    const q = document.getElementById('share-search-input').value.trim().toLowerCase();
    const resContainer = document.getElementById('share-search-results');
    
    if (q.length < 1) {
        resContainer.classList.add('hidden');
        return;
    }
    
    let filtered = shareUsersList.filter(u => u.name.toLowerCase().includes(q) || (u.username && u.username.toLowerCase().includes(q)));
    
    const renderResults = (results) => {
        if (results.length === 0) {
            resContainer.innerHTML = `<div class="p-3 text-center text-white/50 text-xs font-bold">No users found</div>`;
        } else {
            resContainer.innerHTML = results.map(u => {
                const isSelected = selectedShareUsers.has(u._id);
                const ringClass = isSelected ? 'border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]' : 'border-transparent';
                const checkIcon = isSelected ? `<i class="fa-solid fa-circle-check text-pink-500 text-lg"></i>` : `<i class="fa-regular fa-circle text-white/30 text-lg"></i>`;
                return `
                <div onclick="toggleShareUser('${u._id}')" class="flex items-center justify-between p-2.5 hover:bg-white/10 rounded-xl cursor-pointer transition">
                    <div class="flex items-center gap-3">
                        <img src="${u.photo || 'https://placehold.co/40'}" class="w-10 h-10 rounded-full border-2 ${ringClass} object-cover">
                        <div>
                            <div class="text-sm font-bold text-white">${u.name}</div>
                            <div class="text-xs text-white/50">@${u.username || 'user'}</div>
                        </div>
                    </div>
                    ${checkIcon}
                </div>`;
            }).join('');
        }
        resContainer.classList.remove('hidden');
    };

    renderResults(filtered);

    if (q.length >= 2) {
        if (shareSearchTimeout) clearTimeout(shareSearchTimeout);
        currentShareSearchQuery = q;
        shareSearchTimeout = setTimeout(async () => {
            if (currentShareSearchQuery !== q) return;
            try {
                const globalRes = await APIService.chat.search(q);
                if (currentShareSearchQuery !== q) return;
                
                if (globalRes && globalRes.length > 0) {
                    const existingIds = new Set(filtered.map(u => u._id));
                    const myId = localStorage.getItem("userId");
                    let newUsersFound = false;
                    for (let gu of globalRes) {
                        if (!existingIds.has(gu._id) && gu._id !== myId) {
                            filtered.push(gu);
                            existingIds.add(gu._id);
                            newUsersFound = true;
                            if (!shareUsersList.find(x => x._id === gu._id)) {
                                shareUsersList.push(gu);
                            }
                        }
                    }
                    if (newUsersFound) {
                        renderResults(filtered);
                    }
                }
            } catch(e) {}
        }, 500);
    }
}

async function sendSharedReel() {
    if (!currentShareReel || selectedShareUsers.size === 0) return;
    
    const btn = document.getElementById('send-shared-reel-btn');
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> SENDING...`;
    
    const payload = `ZOBBLY_REEL_SHARE||${currentShareReel.id}||${currentShareReel.poster}||${currentShareReel.videoUrl}||${currentShareReel.isYouTube}`;
    
    for (let userId of selectedShareUsers) {
        try {
            await APIService.chat.send(userId, payload);
            
            // Update frequency in backend API
            shareFreqMap[userId] = (shareFreqMap[userId] || 0) + 1;
            APIService.user.updateShareFreq(userId).catch(e=>console.log(e));
        } catch(e) {}
    }
    
    // Backup locally
    localStorage.setItem('reelShareFreq', JSON.stringify(shareFreqMap));
    
    showToast("Reel shared successfully!");
    closeReelShare();
    
    btn.innerHTML = `SEND <span id="share-count-badge" class="bg-white text-pink-600 text-xs px-2 py-0.5 rounded-full shadow-inner">0</span>`;
}

function openSharedReel(reelId) {
    closeFullChat();
    window.targetReelToOpen = reelId;
    renderView('reels');
}


