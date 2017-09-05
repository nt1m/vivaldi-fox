const RuleManager = {
  async init() {
    this.rules = new Map(await Settings.get("rules"));
  },
  set(rule, theme) {
    this.rules.set(theme, rule);
    Settings.set("rules", [...this.rules]);
  },
  async getCurrent(tab) {
    let themes = await Settings.get("themes");
    let defaultTheme = themes[await Settings.get("defaultTheme")];
    try {
      console.log([...this.rules].slice().reverse());
      for (let [theme, rule] of [...this.rules].slice().reverse()) {
        let ruleApplies = await (new Rule(rule)).applies(tab);
        console.log(ruleApplies)
        if (ruleApplies) {
          return themes[theme];
        } 
      }
      return defaultTheme;
    } catch(e) {
      return defaultTheme;
    }
  }
};
RuleManager.init();
