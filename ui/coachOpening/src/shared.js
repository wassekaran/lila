var m = require('mithril');

function decimals(nb) {
  return Number(nb).toFixed(2);
}

var strings = {
  acpl: 'Average centipawn loss',
  ratingDiff: 'Rating points won in this opening, in average',
  result: 'Wins, draws and losses'
};

module.exports = {
  strings: strings,
  progress: function(r) {
    var perf;
    var dec = decimals(r > 0 ? r : -r);
    if (r === 0) perf = m('span', ' =');
    else if (r > 0) perf = m('span.positive[data-icon=N]', dec);
    else if (r < 0) perf = m('span.negative[data-icon=M]', dec);
    return m('span.rating.progress.hint--top', {
      'data-hint': strings.ratingDiff
    }, perf);
  },
  resultBar: function(r) {
    return m('div.result-bar', [
      ['nbWin', 'win'],
      ['nbDraw', 'draw'],
      ['nbLoss', 'loss']
    ].map(function(x) {
      var k = x[0];
      var name = x[1];
      var percent = (r[k] * 100 / r.nbGames);
      return m('div', {
        key: k,
        class: k,
        style: {
          width: percent + '%'
        }
      }, [
        m('strong', Math.round(percent)),
        '% ' + name
      ]);
    }));
  },
  momentFromNow: function(date) {
    return m('time.moment-from-now', {
      config: function(el) {
        $('body').trigger('lichess.content_loaded');
      },
      datetime: date
    });
  },
  chart: {
    makeFont: function(size) {
      return size + "px 'Noto Sans', 'Lucida Grande', 'Lucida Sans Unicode', Verdana, Arial, Helvetica, sans-serif";
    }
  },
  /**
   * https://github.com/niksy/throttle-debounce/blob/master/lib/throttle.js
   *
   * Throttle execution of a function. Especially useful for rate limiting
   * execution of handlers on events like resize and scroll.
   *
   * @param  {Number}    delay          A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
   * @param  {Boolean}   noTrailing     Optional, defaults to false. If noTrailing is true, callback will only execute every `delay` milliseconds while the
   *                                    throttled-function is being called. If noTrailing is false or unspecified, callback will be executed one final time
   *                                    after the last throttled-function call. (After the throttled-function has not been called for `delay` milliseconds,
   *                                    the internal counter is reset)
   * @param  {Function}  callback       A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
   *                                    to `callback` when the throttled-function is executed.
   * @param  {Boolean}   debounceMode   If `debounceMode` is true (at begin), schedule `clear` to execute after `delay` ms. If `debounceMode` is false (at end),
   *                                    schedule `callback` to execute after `delay` ms.
   *
   * @return {Function}  A new, throttled, function.
   */
  throttle: function(delay, noTrailing, callback, debounceMode) {

    // After wrapper has stopped being called, this timeout ensures that
    // `callback` is executed at the proper times in `throttle` and `end`
    // debounce modes.
    var timeoutID;

    // Keep track of the last time `callback` was executed.
    var lastExec = 0;

    // `noTrailing` defaults to falsy.
    if (typeof(noTrailing) !== 'boolean') {
      debounceMode = callback;
      callback = noTrailing;
      noTrailing = undefined;
    }

    // The `wrapper` function encapsulates all of the throttling / debouncing
    // functionality and when executed will limit the rate at which `callback`
    // is executed.
    return function() {

      var self = this;
      var elapsed = Number(new Date()) - lastExec;
      var args = arguments;

      // Execute `callback` and update the `lastExec` timestamp.
      function exec() {
        lastExec = Number(new Date());
        callback.apply(self, args);
      }

      // If `debounceMode` is true (at begin) this is used to clear the flag
      // to allow future `callback` executions.
      function clear() {
        timeoutID = undefined;
      }

      if (debounceMode && !timeoutID) {
        // Since `wrapper` is being called for the first time and
        // `debounceMode` is true (at begin), execute `callback`.
        exec();
      }

      // Clear any existing timeout.
      if (timeoutID) {
        clearTimeout(timeoutID);
      }

      if (debounceMode === undefined && elapsed > delay) {
        // In throttle mode, if `delay` time has been exceeded, execute
        // `callback`.
        exec();

      } else if (noTrailing !== true) {
        // In trailing throttle mode, since `delay` time has not been
        // exceeded, schedule `callback` to execute `delay` ms after most
        // recent execution.
        //
        // If `debounceMode` is true (at begin), schedule `clear` to execute
        // after `delay` ms.
        //
        // If `debounceMode` is false (at end), schedule `callback` to
        // execute after `delay` ms.
        timeoutID = setTimeout(debounceMode ? clear : exec, debounceMode === undefined ? delay - elapsed : delay);
      }
    };
  }
};
