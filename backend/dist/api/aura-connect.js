var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import neo4j from 'neo4j-driver';
(() => __awaiter(void 0, void 0, void 0, function* () {
    // URI examples: 'neo4j://localhost', 'neo4j+s://xxx.databases.neo4j.io'
    const URI = process.env.NEO4J_URI || '';
    const USER = process.env.NEO4J_USERNAME || '';
    const PASSWORD = process.env.NEO4J_PASSWORD || '';
    let driver;
    try {
        driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
        const serverInfo = yield driver.getServerInfo();
        console.log('Connection established');
        console.log(serverInfo);
    }
    catch (err) {
        console.log(`Connection error\n${err}\nCause: ${err.cause}`);
    }
}))();
