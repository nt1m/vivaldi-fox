const PROPERTIES = {
  container: {
    type: "string",
    validate(validate) {
      return true;
    },
    async get(tab) {
      let store = await browser.contextualIdentities.get(tab.cookieStoreId);
      return store.name;
    }
  },
  domain: {
    type: "string",
    validate(value) {
      return true;
    },
    async get(tab) {
      return new URL(tab.url).host;
    }
  },
  year: {
    type: "integer",
    validate(value) {
      return true;
    },
    async get(tab) {
      return (new Date(Date.now())).getFullYear();
    }
  },
  month: {
    type: "integer",
    validate(value) {
      if (value >= 1 && value <= 12) {
        return true;
      } else {
        return new Error("date must be between 1 and 12.");
      }
    },
    async get(tab) {
      return (new Date(Date.now())).getMonth() + 1;
    }
  },
  date: {
    type: "integer",
    validate(value) {
      if (value >= 1 && value <= 31) {
        return true;
      } else {
        return new Error("date must be between 1 and 31.");
      }
    },
    async get(tab) {
      return (new Date(Date.now())).getDate();
    }
  },
  day: {
    type: "integer",
    validate(value) {
      if (value >= 0 && value <= 6) {
        return true;
      } else {
        return new Error("Day should be between 0 and 6, with 0 representing sunday");
      }
    },
    async get(tab) {
      return (new Date(Date.now())).getDay();
    }
  },
  hour: {
    type: "integer",
    validate(value) {
      if (value >= 0 && value <= 23) {
        return true;
      } else {
        return new Error("hour must be between 0 and 23.");
      }
    },
    async get(tab) {
      return (new Date(Date.now())).getHours();
    }
  },
  minutes: {
    type: "integer",
    validate(value) {
      if (value >= 0 && value <= 59) {
        return true;
      } else {
        return new Error("hour must be between 0 and 59.");
      }
    },
    async get(tab) {
      return (new Date(Date.now())).getMinutes();
    }
  },
  seconds: {
    type: "integer",
    validate(value) {
      if (value >= 0 && value <= 59) {
        return true;
      } else {
        return new Error("hour must be between 0 and 59.");
      }
    },
    async get(tab) {
      return (new Date(Date.now())).getSeconds();
    }
  },
}