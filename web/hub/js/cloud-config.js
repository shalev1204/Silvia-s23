    // Cloud save (docs/IDEAS_BACKLOG.md #19): the Supabase project URL and its publishable (anon) key.
    // Both are public by design: the database only lets this key add rows and read one seeker's latest save.
    // Never put a secret or service-role key here. Empty values switch the cloud save off.
    window.ECLIPSE_CLOUD = {
      url: '',
      key: ''
    };
