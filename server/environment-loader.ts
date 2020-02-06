import * as dotenv from 'dotenv';

export class EnvironmentLoader {
  
  constructor(private dotenvModule: typeof dotenv = dotenv) {}
  
  public loadConfig() {
    const dotenvResult = this.dotenvModule.config();
  
    if (dotenvResult.error) {
      throw dotenvResult.error;
    }
    
    // Show that keys work
    // console.log(dotenvResult.parsed);
  }
}
