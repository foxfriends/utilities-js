/* (number) => Promise<void> & { cancel(): this, skip(): this, reset(): this }

  Returns a promise that resolves after a timed delay. This delay is cancellable
  and skippable by use of the wait.skip and wait.cancel. wait.reset will restart
  the timer.
*/
module.exports = time => {
  let timeout, res, rej;
  const pr = new Promise((resolve, reject) => {
    timeout = setTimeout(resolve, time);
    res = resolve;
    rej = reject;
  });
  pr.cancel = () => {
    clearTimeout(timeout);
    rej();
    return pr;
  };
  pr.skip = () => {
    clearTimeout(timeout);
    res();
    return pr;
  };
  pr.reset = () => {
    clearTimeout(timeout);
    timeout = setTimeout(res, time);
    return pr;
  };
  return pr;
};
