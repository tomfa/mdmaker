let debugLog = false;

const createLogger = (prefix) => {
  const log = prefix ? (...args) => console.log(prefix, ...args) : console.log;
  return {
    info: log,
    debug: (...args) => {
      if (!debugLog) {
        return;
      }
      log(...args)
    },
  }
}

const defaultLogger = createLogger();

module.exports = {
  setDebug: (val) => (debugLog = val),
  info: defaultLogger.info,
  debug: defaultLogger.debug,
  createLogger
};
