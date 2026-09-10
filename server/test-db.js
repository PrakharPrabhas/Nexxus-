const dns = require("dns").promises;

async function testDNS() {
    try {
        console.log("Testing Cloudflare DNS...");

        const resolver = new (require("dns").promises.Resolver)();

        resolver.setServers([
            "1.1.1.1",
            "8.8.8.8"
        ]);

        const records = await resolver.resolveSrv(
            "_mongodb._tcp.cluster0.h7cbttl.mongodb.net"
        );

        console.log("✅ SRV lookup successful!");
        console.log(records);

    } catch (error) {
        console.log("❌ SRV lookup failed!");
        console.log(error);
    }
}

testDNS();