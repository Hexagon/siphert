import { Registerer, RegistererState, UserAgent } from "./lib/SIP.js/lib/api/index.js";
import { settings } from "./settings.js";

console.log("Startar siphert...");

function onInvite(invitation) {
    console.log('Inkommande samtal från', invitation.incomingInviteRequest.message.headers.From[0].raw);
    console.log('Siphert tycker det låter läskigt och trycker upptaget!');
    invitation.reject();
}
let lastLog;
const uaOptions = {
  uri: UserAgent.makeURI(settings.uri),
  authorizationPassword: settings.password,
  authorizationUsername: settings.ext,
  delegate: {
    onInvite
  },
  logLevel: "error",
  logConnector: (level, category) => {
    if (category !== lastLog) {
      lastLog = category;
      console.log('\tLog:', level, category);
    }
  },
  transportOptions: {
    server: settings.server
  },
};

const userAgent = new UserAgent(uaOptions);

const registerer = new Registerer(userAgent, {});
registerer.stateChange.addListener((state: RegistererState) => {
  switch (state) {
    case RegistererState.Initial:
      console.log("Siphert försöker logga in ...");
      break;
    case RegistererState.Registered:
      console.log('Siphert är inloggad och väntar på samtal!')
      break;
    case RegistererState.Unregistered:
      console.log('Siphert har loggat ut');
      break;
    case RegistererState.Terminated:
      console.log('Siphert gjorde tok');
      break;
    default:
      throw new Error("Unknown registerer state.");
  }
}, {});

// Connect the user agent
userAgent.start().then(() => {
  console.log("Siphert ansluen till server", uaOptions.uri.host, "via", uaOptions.transportOptions.server);
  console.log("Loggar in siphert på anknytning " + uaOptions.uri.user);

  registerer.register();

});