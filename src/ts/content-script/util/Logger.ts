const RootModule = 'YDM';

export class Logger {
    static debugLevel = 0;

    private prefix: any[];
    
    constructor(module?: string) {
        this.prefix = [`[${RootModule + ((module) ? `/${module}` : '')}]`];
    }

    log(level: number, ...args: any[]) {
        if (Logger.debugLevel < level) return;
        console.log.apply(this, this.prefix.concat(args));
    }

    error(level: number, ...args: any[]) {
        if (Logger.debugLevel < level) return;
        console.error.apply(this, this.prefix.concat(args));
    }
}
