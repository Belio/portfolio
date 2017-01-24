interface Config {
  api: string
};

let config: Config = {
  api: ''
};

export class ConfigService {

  static set(property, value) {
    config[property] = value;
  }

  static get(property) {
    return config[property];
  }

}
