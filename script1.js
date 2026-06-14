
const API_BASE = "https://zobbly.onrender.com";
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
        { id: 'love', name: '❤️ Love', bg: 'url(https://i.ibb.co/spDGj2Q2/Gemini-Generated-Image-izx0sxizx0sxizx0.png)', text: 'text-white', btn: 'bg-pink-600', barColor: 'rgba(255, 230, 240, 0.95)' },
        { id: 'sad', name: '🌧️ Sad / Rain', bg: 'url(https://i.ibb.co/ZsvvCcw/Gemini-Generated-Image-4c7xnb4c7xnb4c7x.png)', text: 'text-white', btn: 'bg-gray-600', barColor: 'rgba(230, 235, 240, 0.95)' },
        { id: 'angry', name: '🔥 Angry / Fire', bg: 'url(https://i.ibb.co/JWWHxzkb/Gemini-Generated-Image-1e28ts1e28ts1e28.png)', text: 'text-white', btn: 'bg-red-700', barColor: 'rgba(255, 230, 230, 0.95)' },
        { id: 'nature', name: '🌿 Nature', bg: 'url(https://i.ibb.co/2YgfZVY6/Gemini-Generated-Image-9djvzu9djvzu9djv.png)', text: 'text-white', btn: 'bg-green-600', barColor: 'rgba(230, 250, 230, 0.95)' },
        { id: 'galaxy', name: '🌌 Galaxy', bg: 'url(https://i.ibb.co/JFSC8Dbx/Gemini-Generated-Image-1dmtnl1dmtnl1dmt.png)', text: 'text-white', btn: 'bg-indigo-600', barColor: 'rgba(230, 230, 250, 0.95)' },
        { id: 'happy', name: '☀️ Happy', bg: 'url(https://i.ibb.co/1GFRhMBr/Gemini-Generated-Image-6encea6encea6enc.png)', text: 'text-gray-800', btn: 'bg-yellow-500', barColor: 'rgba(255, 250, 230, 0.95)' },
        { id: 'night', name: '🌑 Night City', bg: 'url(https://i.ibb.co/wGS6vMf/Gemini-Generated-Image-a27g02a27g02a27g.png)', text: 'text-white', btn: 'bg-blue-900', barColor: 'rgba(200, 210, 230, 0.95)' },
        { id: 'ocean', name: '🌊 Ocean', bg: 'url(https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=600)', text: 'text-white', btn: 'bg-cyan-600', barColor: 'rgba(220, 245, 255, 0.95)' },
        { id: 'sunset', name: '🌅 Sunset', bg: 'url(https://i.ibb.co/W4XXhLX8/Gemini-Generated-Image-xo6dpexo6dpexo6d.png)', text: 'text-white', btn: 'bg-orange-600', barColor: 'rgba(255, 240, 230, 0.95)' },
        { id: 'tech', name: '💻 Cyber', bg: 'url(https://i.ibb.co/KMvTGKm/Gemini-Generated-Image-hhy4sohhy4sohhy4.png)', text: 'text-white', btn: 'bg-blue-600', barColor: 'rgba(220, 230, 255, 0.95)' },
        { id: 'abstract', name: '🎨 Abstract', bg: 'url(https://i.ibb.co/Lzy1Yfhf/Gemini-Generated-Image-o7z6c6o7z6c6o7z6.png)', text: 'text-white', btn: 'bg-pink-500', barColor: 'rgba(255, 235, 255, 0.95)' }
    ];
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
            getProfile: async (id) => (await fetch(`${API_BASE}/api/user/profile/${id}`)).json(),
            getFollowers: async (id) => (await fetch(`${API_BASE}/api/user/followers/${id}`, { headers: getHeaders() })).json(),
            getFollowing: async (id) => (await fetch(`${API_BASE}/api/user/following/${id}`, { headers: getHeaders() })).json(),
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
                const res = await fetch(`${API_BASE}/api/posts?t=${new Date().getTime()}`, {headers: getHeaders()});
                if(!res.ok) throw new Error("Feed Error");
                return res.json();
            },
            getMyPosts: async() => (await fetch(`${API_BASE}/api/my-posts`, {headers:getHeaders()})).json(),
            like: async(id) => fetch(`${API_BASE}/api/posts/like/${id}`, {method:"PUT", headers:getHeaders()}),
            comment: async(id, text) => fetch(`${API_BASE}/api/posts/comment/${id}`, {method:"POST", headers:getHeaders(), body:JSON.stringify({text})}),
            delete: async(id) => fetch(`${API_BASE}/api/posts/${id}`, {method:"DELETE", headers:getHeaders()}),
            deleteComment: async(postId, commentId) => fetch(`${API_BASE}/api/posts/comment/${postId}/${commentId}`, { method: "DELETE", headers: getHeaders() })
        },
        chat: {
            search: async (q) => (await fetch(`${API_BASE}/api/search?q=${q}`, { headers: getHeaders() })).json(),
            send: async (rid, txt) => fetch(`${API_BASE}/api/messages`, { method:"POST", headers:getHeaders(), body:JSON.stringify({receiverId:rid, content:txt}) }),
            upload: async (fd) => fetch(`${API_BASE}/api/messages/upload`, { method: "POST", headers: { "x-auth-token": localStorage.getItem("token") }, body: fd }),
            getHistory: async(id) => (await fetch(`${API_BASE}/api/messages/${id}`, { headers: getHeaders() })).json(),
            deleteMsg: async (id) => { await fetch(`${API_BASE}/api/messages/${id}`, { method: "DELETE", headers: getHeaders() }); },
            clearChat: async (id) => { await fetch(`${API_BASE}/api/messages/clear/${id}`, { method: "DELETE", headers: getHeaders() }); },
            getConversations: async() => (await fetch(`${API_BASE}/api/chat/conversations`, { headers: getHeaders() })).json()
        },
        notifications: {
            getAll: async () => (await fetch(`${API_BASE}/api/notifications`, { headers: getHeaders() })).json(),
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
            const isLongText = p.content.length > 200 || (p.content.match(/\n/g) || []).length > 4;
            const contentId = `post-content-${p._id}`;
            
           
            let linkHtml = '';
            if (p.link) {
                 const displayLink = p.link.length > 40 ? p.link.substring(0, 40) + '...' : p.link;
                 linkHtml = `<button onclick="openLink('${p.link}')" class="w-full mt-2 mb-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:bg-purple-100 text-purple-700 p-3 rounded-xl text-sm text-left truncate border border-purple-100 transition flex items-center shadow-sm"><div class="bg-purple-200 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-purple-600"><i class="fa-solid fa-link"></i></div><div class="flex-1 overflow-hidden"><div class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Open Link</div><div class="truncate font-medium">${displayLink}</div></div><i class="fa-solid fa-chevron-right text-gray-400"></i></button>`;
            } else {
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                const detectedLinks = p.content.match(urlRegex);
                if(detectedLinks && detectedLinks.length > 0) {
                      const firstLink = detectedLinks[0];
                      linkHtml = `<button onclick="openLink('${firstLink}')" class="w-full mt-2 mb-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:bg-purple-100 text-purple-700 p-3 rounded-xl text-sm text-left truncate border border-purple-100 transition flex items-center shadow-sm"><div class="bg-purple-200 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-purple-600"><i class="fa-solid fa-link"></i></div><div class="flex-1 overflow-hidden"><div class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Open Link</div><div class="truncate font-medium">${firstLink}</div></div><i class="fa-solid fa-chevron-right text-gray-400"></i></button>`;
                }
            }

           
            const mediaUrl = p.video || p.image;
            const isVideo = p.video || (p.image && p.image.match(/\.(mp4|mov|webm)$/i));
            let mediaHtml = '';
            
            if (mediaUrl) {
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
                        <div id="${contentId}" class="text-gray-800 mb-2 text-sm whitespace-pre-line break-words ${isLongText ? 'line-clamp-custom' : ''}">${p.content}</div>
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

            let validPosts = feedOnlyPosts.filter(p => { if(!p.userId) return false; const pUserId = p.userId._id || p.userId; return !safeBlockedList.includes(pUserId); });
            let localPosts = validPosts.filter(p => p.userId.country === myCountry);
            let globalPosts = validPosts.filter(p => p.userId.country !== myCountry);
            localPosts = shuffleArray(localPosts);
            globalPosts = shuffleArray(globalPosts);
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
                    const isLongText = p.content.length > 200 || (p.content.match(/\n/g) || []).length > 4;
                    const contentId = `post-content-${p._id}`;
                    
                  
                    let linkHtml = '';
                   
                    if (p.link) {
                         const displayLink = p.link.length > 40 ? p.link.substring(0, 40) + '...' : p.link;
                         linkHtml = `<button onclick="openLink('${p.link}')" class="w-full mt-2 mb-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:bg-purple-100 text-purple-700 p-3 rounded-xl text-sm text-left truncate border border-purple-100 transition flex items-center shadow-sm"><div class="bg-purple-200 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-purple-600"><i class="fa-solid fa-link"></i></div><div class="flex-1 overflow-hidden"><div class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Open Link</div><div class="truncate font-medium">${displayLink}</div></div><i class="fa-solid fa-chevron-right text-gray-400"></i></button>`;
                    } else {
                    
                        const urlRegex = /(https?:\/\/[^\s]+)/g;
                        const detectedLinks = p.content.match(urlRegex);
                        if(detectedLinks && detectedLinks.length > 0) {
                            const firstLink = detectedLinks[0];
                             linkHtml = `<button onclick="openLink('${firstLink}')" class="w-full mt-2 mb-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:bg-purple-100 text-purple-700 p-3 rounded-xl text-sm text-left truncate border border-purple-100 transition flex items-center shadow-sm"><div class="bg-purple-200 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-purple-600"><i class="fa-solid fa-link"></i></div><div class="flex-1 overflow-hidden"><div class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Open Link</div><div class="truncate font-medium">${firstLink}</div></div><i class="fa-solid fa-chevron-right text-gray-400"></i></button>`;
                        }
                    }
                
                    const userHandle = p.userId.username ? `@${p.userId.username}` : '';
                    const userCountry = p.userId.country ? `<span class="ml-1 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500"><i class="fa-solid fa-earth-americas"></i> ${p.userId.country}</span>` : '';
                    const mediaUrl = p.video || p.image;
                    const isVideo = p.video || (p.image && p.image.match(/\.(mp4|mov|webm)$/i));
                    let mediaHtml = '';
                    
                    if (mediaUrl) {
                        if (isVideo) {
                            mediaHtml = `<video src="${mediaUrl}" controls playsinline class="w-full rounded-xl mb-3 object-cover max-h-80 shadow-sm mt-2 bg-black"></video>`;
                        } else {
                            mediaHtml = `<img src="${mediaUrl}" class="w-full rounded-xl mb-3 object-cover max-h-80 shadow-sm mt-2">`;
                        }
                    }
                    
                     return `<div id="post-container-${p._id}" data-userid="${userId}" class="glass-card mb-4 p-4 relative transition-all duration-300">
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
                        <div id="${contentId}" class="text-gray-800 mb-2 text-sm whitespace-pre-line break-words ${isLongText ? 'line-clamp-custom' : ''}">${p.content}</div>
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
    applyTranslations();
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
            const users = await APIService.chat.search(query);
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

   
    async function submitPost() {
    const fd = new FormData();
    
    
    let content = document.getElementById('postContent').value;
    const linkVal = document.getElementById('postLink').value;
    
   
    if(linkVal) {
        content += " " + linkVal; 
    }
    
    fd.append('content', content);

    const f = document.getElementById('postImage').files[0];
    if(f) {
        fd.append('postImage', f);
    }
    await APIService.feed.create(fd);
    document.getElementById('postModal').classList.add('hidden');
    document.getElementById('postContent').value = "";
    document.getElementById('postLink').value = "";
    document.getElementById('postImage').value = "";
    
    renderView('feed');
}


    async function toggleLike(id) {
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
    function openConfirmModal(title, message, actionCallback) { document.getElementById('modalTitle').innerText = title; document.getElementById('modalMessage').innerText = message; pendingConfirmAction = actionCallback; document.getElementById('universalConfirmModal').style.display = 'flex'; }
    function openAlertModal(title, message) { document.getElementById('modalTitle').innerText = title; document.getElementById('modalMessage').innerText = message; document.querySelector('#universalConfirmModal .btn-cancel').style.display = 'none'; document.getElementById('modalConfirmBtn').innerText = "OK"; pendingConfirmAction = null; document.getElementById('universalConfirmModal').style.display = 'flex'; }
    function closeConfirmModal() { document.getElementById('universalConfirmModal').style.display = 'none'; pendingConfirmAction = null; document.querySelector('#universalConfirmModal .btn-cancel').style.display = 'block'; document.getElementById('modalConfirmBtn').innerText = "Yes, Proceed"; }
    async function executeConfirmAction() { if(pendingConfirmAction) { await pendingConfirmAction(); } closeConfirmModal(); }

    function deletePost(id) {
        openConfirmModal("Delete Post?", "Are you sure you want to permanently delete this post?", async () => {
            const el = document.getElementById(`post-container-${id}`);
            if(el) { el.style.transition = "all 0.3s"; el.style.opacity = "0"; setTimeout(() => el.remove(), 300); }
            try { await APIService.feed.delete(id); showToast("Post Deleted"); } catch(e) { showToast("Error deleting post"); }
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
    const posts = data.posts; 
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
            <img src="${u.photo||'https://placehold.co/100'}" class="relative w-24 h-24 rounded-full mx-auto mb-2 object-cover border-4 border-white shadow-xl" ${isMe ? 'onclick="document.getElementById(\'photoInput\').click()"' : ''}>
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
                    let linkHtml = '';
                    if (p.link) {
                         const displayLink = p.link.length > 40 ? p.link.substring(0, 40) + '...' : p.link;
                         linkHtml = `<button onclick="openLink('${p.link}')" class="w-full mt-2 mb-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:bg-purple-100 text-purple-700 p-3 rounded-xl text-sm text-left truncate border border-purple-100 transition flex items-center shadow-sm"><div class="bg-purple-200 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-purple-600"><i class="fa-solid fa-link"></i></div><div class="flex-1 overflow-hidden"><div class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Open Link</div><div class="truncate font-medium">${displayLink}</div></div><i class="fa-solid fa-chevron-right text-gray-400"></i></button>`;
                    } else {
                        const urlRegex = /(https?:\/\/[^\s]+)/g;
                        const detectedLinks = p.content.match(urlRegex);
                        if(detectedLinks && detectedLinks.length > 0) {
                              const firstLink = detectedLinks[0];
                              linkHtml = `<button onclick="openLink('${firstLink}')" class="w-full mt-2 mb-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:bg-purple-100 text-purple-700 p-3 rounded-xl text-sm text-left truncate border border-purple-100 transition flex items-center shadow-sm"><div class="bg-purple-200 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-purple-600"><i class="fa-solid fa-link"></i></div><div class="flex-1 overflow-hidden"><div class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Open Link</div><div class="truncate font-medium">${firstLink}</div></div><i class="fa-solid fa-chevron-right text-gray-400"></i></button>`;
                        }
                    }

                    return `
                    <div id="post-wrapper-${p._id}" class="contents">
                        <div class="relative aspect-square bg-gray-200 overflow-hidden cursor-pointer group" onclick="toggleComment('${p._id}')">
                            
                            ${isMe ? `<button onclick="event.stopPropagation(); deletePost('${p._id}')" class="absolute top-2 right-2 z-20 bg-black/60 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition shadow-md backdrop-blur-sm"><i class="fa-solid fa-trash text-xs"></i></button>` : ''}
                            ${mediaUrl ? 
                                (isVideo ? 
                                    `<video src="${mediaUrl}" class="w-full h-full object-cover block" preload="metadata" muted playsinline></video>
                                     <div class="absolute inset-0 flex items-center justify-center pointer-events-none"><i class="fa-solid fa-play text-white/80 text-xl shadow-sm"></i></div>` : 
                                    `<img src="${mediaUrl}" class="w-full h-full object-cover block">`) 
                                : `<div class="w-full h-full flex items-center justify-center p-2 bg-purple-100 text-[10px] text-gray-700 font-bold text-center break-words">${p.content.substring(0, 50)}</div>`
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
                                <p class="text-sm text-gray-700 mb-2 whitespace-pre-line">${p.content}</p>
                                
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
    <div class="glass-card h-[calc(100vh-140px)] relative flex flex-col overflow-hidden p-0 w-full">
        <div class="p-3 border-b bg-white flex items-center shadow-sm z-10 shrink-0">
            <div class="flex bg-gray-100 rounded-full w-full overflow-hidden border border-gray-200 focus-within:border-purple-400 transition-colors">
                <div class="pl-4 pr-2 flex items-center justify-center text-gray-400">
                    <i class="fa-solid fa-search"></i>
                </div>
                <input onkeyup="searchChatUsers(this.value)" placeholder="${txt('search')}..." class="w-full py-2.5 text-sm bg-transparent outline-none pr-3">
            </div>
        </div>
        <div id="chat-list" class="flex-1 overflow-y-auto bg-white"></div>
    </div>`;
    loadConversations();
}

async function loadConversations() { 
    const users = await APIService.chat.getConversations(); 
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

async function searchChatUsers(q) { 
    if(q.length < 1) return loadConversations(); 
    const users = await APIService.chat.search(q); 
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
    activeChatUser = id;
    window.chatScrolledOnce = false;
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

    const chatMsgs = document.getElementById('fc-messages');
    const tempId = 'temp-' + Date.now();
    const themeBtn = (typeof currentTheme !== 'undefined' && currentTheme.btn) ? currentTheme.btn : 'bg-purple-600';

   
    const html = `
        <div class="flex justify-end mb-2" id="${tempId}">
            <div class="chat-bubble-user ${themeBtn} text-white px-4 py-2 text-sm max-w-[80%] shadow-md opacity-70">
                ${txt}
                <div class="text-[9px] opacity-70 text-right mt-1 font-mono flex items-center justify-end gap-1">
                    Sending... <i class="fa-solid fa-spinner fa-spin text-[8px]"></i>
                </div>
            </div>
        </div>`;
    
    chatMsgs.insertAdjacentHTML('beforeend', html);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
    input.value = ""; 
    input.focus();

    try {
        await APIService.chat.send(activeChatUser, txt);
        await loadMsgs();
    } catch(e) {
        const tempEl = document.getElementById(tempId);
        if(tempEl) tempEl.querySelector('.text-[9px]').innerHTML = `<span class="text-red-300">Failed</span>`;
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
    
    // Save current scroll state before modifying innerHTML
    // Check if user is within 100px from the bottom
    const isNearBottom = chatMsgs.scrollHeight - chatMsgs.scrollTop - chatMsgs.clientHeight < 100;
    
    const msgs = await APIService.chat.getHistory(activeChatUser);
    const myId = localStorage.getItem("userId");
    const themeBtn = (typeof currentTheme !== 'undefined' && currentTheme.btn) ? currentTheme.btn : 'bg-purple-600';

    chatMsgs.innerHTML = msgs.map(m => {
        let content = m.content;
        if(m.type==='image') { content = `<div class="relative inline-block"><img src="${m.fileUrl}" class="max-w-[200px] rounded-lg border shadow-sm"><button onclick="downloadImage('${m.fileUrl}')" class="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] p-1.5 rounded-full hover:bg-black/70"><i class="fa-solid fa-download"></i></button></div>`; }
        const isMe = m.senderId === myId;
        const bubbleClass = isMe ? `chat-bubble-user ${themeBtn} text-white self-end` : 'chat-bubble-other self-start bg-white/90 backdrop-blur-sm';
        return `<div class="flex ${isMe ? 'justify-end' : 'justify-start'} mb-2 group">${isMe ? `<button onclick="deleteSingleMsg('${m._id}')" class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition text-[10px] mr-2"><i class="fa-solid fa-trash"></i></button>` : ''}<div class="${bubbleClass} px-4 py-2 text-sm max-w-[80%] shadow-md">${content}<div class="text-[9px] opacity-70 text-right mt-1 font-mono">${new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div></div></div>`;
    }).join('');
    
    if (isNearBottom || !window.chatScrolledOnce) {
        chatMsgs.scrollTop = chatMsgs.scrollHeight;
        window.chatScrolledOnce = true;
    }
}



async function clearChat() { openConfirmModal("Clear Chat?", "Are you sure?", async () => { await APIService.chat.clearChat(activeChatUser); loadMsgs(); }); }
async function deleteSingleMsg(id) { openConfirmModal("Delete?", "Delete message?", async () => { await APIService.chat.deleteMsg(id); loadMsgs(); }); }


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
                
                // MP4 POSTER
                let posterUrl = p.image || ""; 

                if (isYouTube && ytId) {
                    // Force the clean embed URL to avoid the giant Shorts logo and heavy page load
                    videoUrl = `https://www.youtube.com/embed/${ytId}?enablejsapi=1&rel=0&controls=0&modestbranding=1&loop=1&playlist=${ytId}&autoplay=0&playsinline=1&iv_load_policy=3&disablekb=1`;
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
                                <div class="absolute inset-0 flex items-center justify-center z-10" id="loader-${p._id}">
                                    <i class="fa-solid fa-circle-notch fa-spin text-4xl text-purple-500"></i>
                                </div>
                                <video loop muted playsinline webkit-playsinline preload="auto" poster="${posterUrl}"
                                    class="reel-video opacity-0 transition-opacity duration-500 absolute inset-0 w-full h-full object-cover z-20" 
                                    id="vid-${p._id}"
                                    onwaiting="document.getElementById('loader-${p._id}').classList.remove('hidden')"
                                    onplaying="document.getElementById('loader-${p._id}').classList.add('hidden'); this.classList.remove('opacity-0')"
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

document.getElementById('postImage').onchange = function(e) {
    const file = e.target.files[0];
    if(!file) return;
    
    const reader = new FileReader();
    const previewBox = document.getElementById('mediaPreviewBox');
    
    reader.onload = function(event) {
        document.getElementById('postModal').classList.add('hidden');
        document.getElementById('postEditorModal').classList.remove('hidden');
        
        if(file.type.startsWith('video')) {
            previewBox.innerHTML = `<video id="previewMedia" src="${event.target.result}" loop muted autoplay class="max-w-full max-h-[70vh]"></video>`;
        } else {
            previewBox.innerHTML = `<img id="previewMedia" src="${event.target.result}" class="max-w-full max-h-[70vh] object-contain">`;
        }
    };
    reader.readAsDataURL(file);
};

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

