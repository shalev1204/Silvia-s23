
    // The one-click "Transcribe Complete Journal Notes" shortcuts are for the admin tester only
    (function hideSolveShortcuts() {
      if (window.isAdminTester && window.isAdminTester()) return;
      ['btn-lexicon-solve-all', 'btn-clepsydra-solve-all', 'btn-auto-fill-word'].forEach((id) => {
        const b = document.getElementById(id);
        if (b) b.style.display = 'none';
      });
    })();
