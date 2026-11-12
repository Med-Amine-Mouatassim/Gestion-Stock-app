(function () {
  const FIREBASE_CONFIG = {
    projectId: "stock-39779",
    appId: "1:158388559832:web:b602cacd8029b589c51cad",
    storageBucket: "stock-39779.firebasestorage.app",
    apiKey: "AIzaSyDZanRdCzy76lJpXHvAML64QGHjlGV41Lk",
    authDomain: "stock-39779.firebaseapp.com",
    messagingSenderId: "158388559832",
    measurementId: "G-DJY60E2N7R"
  };

  function getCurrentPageTarget() {
    const page = window.location.pathname.split("/").pop() || "index.html";
    return page + window.location.search + window.location.hash;
  }

  function redirectToAuthPage() {
    const target = encodeURIComponent(getCurrentPageTarget());
    window.location.replace("auth.html?redirect=" + target);
  }

  function initFirebaseIfNeeded() {
    if (!window.firebase || typeof window.firebase.initializeApp !== "function") {
      return false;
    }
    if (!firebase.apps || firebase.apps.length === 0) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    return true;
  }

  function ensureAuthenticatedUser() {
    return new Promise((resolve) => {
      if (!window.firebase || !window.firebase.auth) {
        redirectToAuthPage();
        resolve(false);
        return;
      }

      try {
        if (!initFirebaseIfNeeded()) {
          redirectToAuthPage();
          resolve(false);
          return;
        }
      } catch (error) {
        redirectToAuthPage();
        resolve(false);
        return;
      }

      const auth = firebase.auth();
      let resolved = false;
      auth.onAuthStateChanged((user) => {
        if (resolved) {
          return;
        }
        resolved = true;
        if (!user) {
          redirectToAuthPage();
          resolve(false);
          return;
        }

        try {
          localStorage.setItem("auth_user", JSON.stringify({
            uid: user.uid,
            email: user.email || ""
          }));
        } catch (error) {
          // LocalStorage may be unavailable in some private browsing modes.
        }

        resolve(true);
      }, () => {
        if (resolved) {
          return;
        }
        resolved = true;
        redirectToAuthPage();
        resolve(false);
      });
    });
  }

  async function signOutUser() {
    try {
      if (window.firebase && window.firebase.auth) {
        initFirebaseIfNeeded();
        await firebase.auth().signOut();
      }
    } finally {
      try {
        localStorage.removeItem("auth_user");
      } catch (error) {
        // Ignore localStorage errors.
      }
      window.location.replace("auth.html");
    }
  }

  window.AuthGuard = {
    ensureAuthenticatedUser: ensureAuthenticatedUser,
    signOutUser: signOutUser
  };
})();
