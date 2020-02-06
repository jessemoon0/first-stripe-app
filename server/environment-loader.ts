import * as dotenv from 'dotenv';

export class EnvironmentLoader {
  
  constructor(private dotenvModule: typeof dotenv = dotenv) {}
  
  public loadConfig() {
    const dotenvResult = this.dotenvModule.config();
  
    if (dotenvResult.error) {
      throw dotenvResult.error;
    }
  
    console.log(dotenvResult.parsed);
  }
}
