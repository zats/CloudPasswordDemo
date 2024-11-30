"use strict";
var sjcl = {
  cipher: {},
  hash: {},
  keyexchange: {},
  mode: {},
  misc: {},
  codec: {},
  exception: {
    corrupt: function (e) {
      (this.toString = function () {
        return "CORRUPT: " + this.message;
      }),
        (this.message = e);
    },
    invalid: function (e) {
      (this.toString = function () {
        return "INVALID: " + this.message;
      }),
        (this.message = e);
    },
    bug: function (e) {
      (this.toString = function () {
        return "BUG: " + this.message;
      }),
        (this.message = e);
    },
    notReady: function (e) {
      (this.toString = function () {
        return "NOT READY: " + this.message;
      }),
        (this.message = e);
    },
  },
};
function t(e, s, n) {
  if (4 !== s.length) throw new sjcl.exception.invalid("invalid aes block size");
  var i = e.b[n],
    r = s[0] ^ i[0],
    o = s[n ? 3 : 1] ^ i[1],
    l = s[2] ^ i[2];
  s = s[n ? 1 : 3] ^ i[3];
  var h,
    u,
    m,
    g,
    p = i.length / 4 - 2,
    f = 4,
    S = [0, 0, 0, 0];
  e = (h = e.w[n])[0];
  var b = h[1],
    y = h[2],
    T = h[3],
    I = h[4];
  for (g = 0; g < p; g++)
    (h = e[r >>> 24] ^ b[(o >> 16) & 255] ^ y[(l >> 8) & 255] ^ T[255 & s] ^ i[f]),
      (u = e[o >>> 24] ^ b[(l >> 16) & 255] ^ y[(s >> 8) & 255] ^ T[255 & r] ^ i[f + 1]),
      (m = e[l >>> 24] ^ b[(s >> 16) & 255] ^ y[(r >> 8) & 255] ^ T[255 & o] ^ i[f + 2]),
      (s = e[s >>> 24] ^ b[(r >> 16) & 255] ^ y[(o >> 8) & 255] ^ T[255 & l] ^ i[f + 3]),
      (f += 4),
      (r = h),
      (o = u),
      (l = m);
  for (g = 0; 4 > g; g++) (S[n ? 3 & -g : g] = (I[r >>> 24] << 24) ^ (I[(o >> 16) & 255] << 16) ^ (I[(l >> 8) & 255] << 8) ^ I[255 & s] ^ i[f++]), (h = r), (r = o), (o = l), (l = s), (s = h);
  return S;
}
function z(e, s) {
  var n,
    i = sjcl.random.H[e],
    r = [];
  for (n in i) i.hasOwnProperty(n) && r.push(i[n]);
  for (n = 0; n < r.length; n++) r[n](s);
}
function B(e, s) {
  "undefined" != typeof window && window.performance && "function" == typeof window.performance.now ? e.addEntropy(window.performance.now(), s, "loadtime") : e.addEntropy(new Date().valueOf(), s, "loadtime");
}
function v(e) {
  (e.b = w(e).concat(w(e))), (e.I = new sjcl.cipher.aes(e.b));
}
function w(e) {
  for (var s = 0; 4 > s && ((e.o[s] = (e.o[s] + 1) | 0), !e.o[s]); s++);
  return e.I.encrypt(e.o);
}
function A(e, s) {
  return function () {
    s.apply(e, arguments);
  };
}
(sjcl.cipher.aes = function (e) {
  this.w[0][0][0] || this.L();
  var s,
    n,
    i,
    r,
    o = this.w[0][4],
    l = this.w[1],
    h = 1;
  if (4 !== (s = e.length) && 6 !== s && 8 !== s) throw new sjcl.exception.invalid("invalid aes key size");
  for (this.b = [(i = e.slice(0)), (r = [])], e = s; e < 4 * s + 28; e++)
    (n = i[e - 1]),
      (0 == e % s || (8 === s && 4 == e % s)) && ((n = (o[n >>> 24] << 24) ^ (o[(n >> 16) & 255] << 16) ^ (o[(n >> 8) & 255] << 8) ^ o[255 & n]), 0 == e % s && ((n = (n << 8) ^ (n >>> 24) ^ (h << 24)), (h = (h << 1) ^ (283 * (h >> 7))))),
      (i[e] = i[e - s] ^ n);
  for (s = 0; e; s++, e--) (n = i[3 & s ? e : e - 4]), (r[s] = 4 >= e || 4 > s ? n : l[0][o[n >>> 24]] ^ l[1][o[(n >> 16) & 255]] ^ l[2][o[(n >> 8) & 255]] ^ l[3][o[255 & n]]);
}),
  (sjcl.cipher.aes.prototype = {
    encrypt: function (e) {
      return t(this, e, 0);
    },
    decrypt: function (e) {
      return t(this, e, 1);
    },
    w: [
      [[], [], [], [], []],
      [[], [], [], [], []],
    ],
    L: function () {
      var e,
        s,
        n,
        i,
        r,
        o,
        l,
        h = this.w[0],
        u = this.w[1],
        m = h[4],
        g = u[4],
        p = [],
        f = [];
      for (e = 0; 256 > e; e++) f[(p[e] = (e << 1) ^ (283 * (e >> 7))) ^ e] = e;
      for (s = n = 0; !m[s]; s ^= i || 1, n = f[n] || 1)
        for (
          o = ((o = n ^ (n << 1) ^ (n << 2) ^ (n << 3) ^ (n << 4)) >> 8) ^ (255 & o) ^ 99,
            m[s] = o,
            g[o] = s,
            l = (16843009 * (r = p[(e = p[(i = p[s])])])) ^ (65537 * e) ^ (257 * i) ^ (16843008 * s),
            r = (257 * p[o]) ^ (16843008 * o),
            e = 0;
          4 > e;
          e++
        )
          (h[e][s] = r = (r << 24) ^ (r >>> 8)), (u[e][o] = l = (l << 24) ^ (l >>> 8));
      for (e = 0; 5 > e; e++) (h[e] = h[e].slice(0)), (u[e] = u[e].slice(0));
    },
  }),
  (sjcl.bitArray = {
    bitSlice: function (e, s, n) {
      return (e = sjcl.bitArray.X(e.slice(s / 32), 32 - (31 & s)).slice(1)), void 0 === n ? e : sjcl.bitArray.clamp(e, n - s);
    },
    extract: function (e, s, n) {
      var i = Math.floor((-s - n) & 31);
      return (-32 & ((s + n - 1) ^ s) ? (e[(s / 32) | 0] << (32 - i)) ^ (e[(s / 32 + 1) | 0] >>> i) : e[(s / 32) | 0] >>> i) & ((1 << n) - 1);
    },
    concat: function (e, s) {
      if (0 === e.length || 0 === s.length) return e.concat(s);
      var n = e[e.length - 1],
        i = sjcl.bitArray.getPartial(n);
      return 32 === i ? e.concat(s) : sjcl.bitArray.X(s, i, 0 | n, e.slice(0, e.length - 1));
    },
    bitLength: function (e) {
      var s = e.length;
      return 0 === s ? 0 : 32 * (s - 1) + sjcl.bitArray.getPartial(e[s - 1]);
    },
    clamp: function (e, s) {
      if (32 * e.length < s) return e;
      var n = (e = e.slice(0, Math.ceil(s / 32))).length;
      return (s &= 31), 0 < n && s && (e[n - 1] = sjcl.bitArray.partial(s, e[n - 1] & (2147483648 >> (s - 1)), 1)), e;
    },
    partial: function (e, s, n) {
      return 32 === e ? s : (n ? 0 | s : s << (32 - e)) + 1099511627776 * e;
    },
    getPartial: function (e) {
      return Math.round(e / 1099511627776) || 32;
    },
    equal: function (e, s) {
      if (sjcl.bitArray.bitLength(e) !== sjcl.bitArray.bitLength(s)) return !1;
      var n,
        i = 0;
      for (n = 0; n < e.length; n++) i |= e[n] ^ s[n];
      return 0 === i;
    },
    X: function (e, s, n, i) {
      var r;
      for (r = 0, void 0 === i && (i = []); 32 <= s; s -= 32) i.push(n), (n = 0);
      if (0 === s) return i.concat(e);
      for (r = 0; r < e.length; r++) i.push(n | (e[r] >>> s)), (n = e[r] << (32 - s));
      return (r = e.length ? e[e.length - 1] : 0), (e = sjcl.bitArray.getPartial(r)), i.push(sjcl.bitArray.partial((s + e) & 31, 32 < s + e ? n : i.pop(), 1)), i;
    },
    ka: function (e, s) {
      return [e[0] ^ s[0], e[1] ^ s[1], e[2] ^ s[2], e[3] ^ s[3]];
    },
    byteswapM: function (e) {
      var s, n;
      for (s = 0; s < e.length; ++s) (n = e[s]), (e[s] = (n >>> 24) | ((n >>> 8) & 65280) | ((65280 & n) << 8) | (n << 24));
      return e;
    },
  }),
  (sjcl.codec.utf8String = {
    fromBits: function (e) {
      var s,
        n,
        i = "",
        r = sjcl.bitArray.bitLength(e);
      for (s = 0; s < r / 8; s++) !(3 & s) && (n = e[s / 4]), (i += String.fromCharCode(((n >>> 8) >>> 8) >>> 8)), (n <<= 8);
      return decodeURIComponent(escape(i));
    },
    toBits: function (e) {
      e = unescape(encodeURIComponent(e));
      var s,
        n = [],
        i = 0;
      for (s = 0; s < e.length; s++) (i = (i << 8) | e.charCodeAt(s)), !(3 & ~s) && (n.push(i), (i = 0));
      return 3 & s && n.push(sjcl.bitArray.partial(8 * (3 & s), i)), n;
    },
  }),
  (sjcl.codec.hex = {
    fromBits: function (e) {
      var s,
        n = "";
      for (s = 0; s < e.length; s++) n += (0xf00000000000 + (0 | e[s])).toString(16).substr(4);
      return n.substr(0, sjcl.bitArray.bitLength(e) / 4);
    },
    toBits: function (e) {
      var s,
        n,
        i = [];
      for (n = (e = e.replace(/\s|0x/g, "")).length, e += "00000000", s = 0; s < e.length; s += 8) i.push(0 ^ parseInt(e.substr(s, 8), 16));
      return sjcl.bitArray.clamp(i, 4 * n);
    },
  }),
  (sjcl.codec.base64 = {
    P: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    fromBits: function (e, s, n) {
      var i = "",
        r = 0,
        o = sjcl.codec.base64.P,
        l = 0,
        h = sjcl.bitArray.bitLength(e);
      for (n && (o = o.substr(0, 62) + "-_"), n = 0; 6 * i.length < h; ) (i += o.charAt((l ^ (e[n] >>> r)) >>> 26)), 6 > r ? ((l = e[n] << (6 - r)), (r += 26), n++) : ((l <<= 6), (r -= 6));
      for (; 3 & i.length && !s; ) i += "=";
      return i;
    },
    toBits: function (e, s) {
      e = e.replace(/\s|=/g, "");
      var n,
        i,
        r = [],
        o = 0,
        l = sjcl.codec.base64.P,
        h = 0;
      for (s && (l = l.substr(0, 62) + "-_"), n = 0; n < e.length; n++) {
        if (0 > (i = l.indexOf(e.charAt(n)))) throw new sjcl.exception.invalid("this isn't base64!");
        26 < o ? ((o -= 26), r.push(h ^ (i >>> o)), (h = i << (32 - o))) : (h ^= i << (32 - (o += 6)));
      }
      return 56 & o && r.push(sjcl.bitArray.partial(56 & o, h, 1)), r;
    },
  }),
  (sjcl.codec.base64url = {
    fromBits: function (e) {
      return sjcl.codec.base64.fromBits(e, 1, 1);
    },
    toBits: function (e) {
      return sjcl.codec.base64.toBits(e, 1);
    },
  }),
  (sjcl.codec.bytes = {
    fromBits: function (e) {
      var s,
        n,
        i = [],
        r = sjcl.bitArray.bitLength(e);
      for (s = 0; s < r / 8; s++) !(3 & s) && (n = e[s / 4]), i.push(n >>> 24), (n <<= 8);
      return i;
    },
    toBits: function (e) {
      var s,
        n = [],
        i = 0;
      for (s = 0; s < e.length; s++) (i = (i << 8) | e[s]), !(3 & ~s) && (n.push(i), (i = 0));
      return 3 & s && n.push(sjcl.bitArray.partial(8 * (3 & s), i)), n;
    },
  }),
  (sjcl.hash.sha256 = function (e) {
    this.b[0] || this.L(), e ? ((this.i = e.i.slice(0)), (this.f = e.f.slice(0)), (this.c = e.c)) : this.reset();
  }),
  (sjcl.hash.sha256.hash = function (e) {
    return new sjcl.hash.sha256().update(e).finalize();
  }),
  (sjcl.hash.sha256.prototype = {
    blockSize: 512,
    reset: function () {
      return (this.i = this.C.slice(0)), (this.f = []), (this.c = 0), this;
    },
    update: function (e) {
      "string" == typeof e && (e = sjcl.codec.utf8String.toBits(e));
      var s,
        n = (this.f = sjcl.bitArray.concat(this.f, e));
      if (((s = this.c), 9007199254740991 < (e = this.c = s + sjcl.bitArray.bitLength(e)))) throw new sjcl.exception.invalid("Cannot hash more than 2^53 - 1 bits");
      if ("undefined" != typeof Uint32Array) {
        var i = new Uint32Array(n),
          r = 0;
        for (s = 512 + s - ((512 + s) & 511); s <= e; s += 512) this.m(i.subarray(16 * r, 16 * (r + 1))), (r += 1);
        n.splice(0, 16 * r);
      } else for (s = 512 + s - ((512 + s) & 511); s <= e; s += 512) this.m(n.splice(0, 16));
      return this;
    },
    finalize: function () {
      var e,
        s = this.f,
        n = this.i;
      for (e = (s = sjcl.bitArray.concat(s, [sjcl.bitArray.partial(1, 1)])).length + 2; 15 & e; e++) s.push(0);
      for (s.push(Math.floor(this.c / 4294967296)), s.push(0 | this.c); s.length; ) this.m(s.splice(0, 16));
      return this.reset(), n;
    },
    C: [],
    b: [],
    L: function () {
      function a(e) {
        return (4294967296 * (e - Math.floor(e))) | 0;
      }
      for (var e, s, n = 0, i = 2; 64 > n; i++) {
        for (s = !0, e = 2; e * e <= i; e++)
          if (0 == i % e) {
            s = !1;
            break;
          }
        s && (8 > n && (this.C[n] = a(Math.pow(i, 0.5))), (this.b[n] = a(Math.pow(i, 1 / 3))), n++);
      }
    },
    m: function (e) {
      var s,
        n,
        i,
        r = this.i,
        o = this.b,
        l = r[0],
        h = r[1],
        u = r[2],
        m = r[3],
        g = r[4],
        p = r[5],
        f = r[6],
        S = r[7];
      for (s = 0; 64 > s; s++)
        16 > s
          ? (n = e[s])
          : ((n = e[(s + 1) & 15]),
            (i = e[(s + 14) & 15]),
            (n = e[15 & s] = (((n >>> 7) ^ (n >>> 18) ^ (n >>> 3) ^ (n << 25) ^ (n << 14)) + ((i >>> 17) ^ (i >>> 19) ^ (i >>> 10) ^ (i << 15) ^ (i << 13)) + e[15 & s] + e[(s + 9) & 15]) | 0)),
          (n = n + S + ((g >>> 6) ^ (g >>> 11) ^ (g >>> 25) ^ (g << 26) ^ (g << 21) ^ (g << 7)) + (f ^ (g & (p ^ f))) + o[s]),
          (S = f),
          (f = p),
          (p = g),
          (g = (m + n) | 0),
          (m = u),
          (u = h),
          (l = (n + (((h = l) & u) ^ (m & (h ^ u))) + ((h >>> 2) ^ (h >>> 13) ^ (h >>> 22) ^ (h << 30) ^ (h << 19) ^ (h << 10))) | 0);
      (r[0] = (r[0] + l) | 0), (r[1] = (r[1] + h) | 0), (r[2] = (r[2] + u) | 0), (r[3] = (r[3] + m) | 0), (r[4] = (r[4] + g) | 0), (r[5] = (r[5] + p) | 0), (r[6] = (r[6] + f) | 0), (r[7] = (r[7] + S) | 0);
    },
  }),
  (sjcl.hash.sha1 = function (e) {
    e ? ((this.i = e.i.slice(0)), (this.f = e.f.slice(0)), (this.c = e.c)) : this.reset();
  }),
  (sjcl.hash.sha1.hash = function (e) {
    return new sjcl.hash.sha1().update(e).finalize();
  }),
  (sjcl.hash.sha1.prototype = {
    blockSize: 512,
    reset: function () {
      return (this.i = this.C.slice(0)), (this.f = []), (this.c = 0), this;
    },
    update: function (e) {
      "string" == typeof e && (e = sjcl.codec.utf8String.toBits(e));
      var s,
        n = (this.f = sjcl.bitArray.concat(this.f, e));
      if (((s = this.c), 9007199254740991 < (e = this.c = s + sjcl.bitArray.bitLength(e)))) throw new sjcl.exception.invalid("Cannot hash more than 2^53 - 1 bits");
      if ("undefined" != typeof Uint32Array) {
        var i = new Uint32Array(n),
          r = 0;
        for (s = this.blockSize + s - ((this.blockSize + s) & (this.blockSize - 1)); s <= e; s += this.blockSize) this.m(i.subarray(16 * r, 16 * (r + 1))), (r += 1);
        n.splice(0, 16 * r);
      } else for (s = this.blockSize + s - ((this.blockSize + s) & (this.blockSize - 1)); s <= e; s += this.blockSize) this.m(n.splice(0, 16));
      return this;
    },
    finalize: function () {
      var e,
        s = this.f,
        n = this.i;
      for (e = (s = sjcl.bitArray.concat(s, [sjcl.bitArray.partial(1, 1)])).length + 2; 15 & e; e++) s.push(0);
      for (s.push(Math.floor(this.c / 4294967296)), s.push(0 | this.c); s.length; ) this.m(s.splice(0, 16));
      return this.reset(), n;
    },
    C: [1732584193, 4023233417, 2562383102, 271733878, 3285377520],
    b: [1518500249, 1859775393, 2400959708, 3395469782],
    m: function (e) {
      var s,
        n,
        i,
        r,
        o,
        l,
        h,
        u = this.i;
      if ("undefined" != typeof Uint32Array) for (h = Array(80), n = 0; 16 > n; n++) h[n] = e[n];
      else h = e;
      for (n = u[0], i = u[1], r = u[2], o = u[3], l = u[4], e = 0; 79 >= e; e++)
        16 <= e && ((s = h[e - 3] ^ h[e - 8] ^ h[e - 14] ^ h[e - 16]), (h[e] = (s << 1) | (s >>> 31))),
          (s = (((n << 5) | (n >>> 27)) + (s = 19 >= e ? (i & r) | (~i & o) : 39 >= e ? i ^ r ^ o : 59 >= e ? (i & r) | (i & o) | (r & o) : 79 >= e ? i ^ r ^ o : void 0) + l + h[e] + this.b[Math.floor(e / 20)]) | 0),
          (l = o),
          (o = r),
          (r = (i << 30) | (i >>> 2)),
          (i = n),
          (n = s);
      (u[0] = (u[0] + n) | 0), (u[1] = (u[1] + i) | 0), (u[2] = (u[2] + r) | 0), (u[3] = (u[3] + o) | 0), (u[4] = (u[4] + l) | 0);
    },
  }),
  (sjcl.mode.gcm = {
    name: "gcm",
    encrypt: function (e, s, n, i, r) {
      var o = s.slice(0);
      return (s = sjcl.bitArray), (i = i || []), (e = sjcl.mode.gcm.S(!0, e, o, i, n, r || 128)), s.concat(e.data, e.tag);
    },
    decrypt: function (e, s, n, i, r) {
      var o = s.slice(0),
        l = sjcl.bitArray,
        h = l.bitLength(o);
      if (((i = i || []), (r = r || 128) <= h ? ((s = l.bitSlice(o, h - r)), (o = l.bitSlice(o, 0, h - r))) : ((s = o), (o = [])), (e = sjcl.mode.gcm.S(!1, e, o, i, n, r)), !l.equal(e.tag, s)))
        throw new sjcl.exception.corrupt("gcm: tag doesn't match");
      return e.data;
    },
    ea: function (e, s) {
      var n,
        i,
        r,
        o,
        l,
        h = sjcl.bitArray.ka;
      for (r = [0, 0, 0, 0], o = s.slice(0), n = 0; 128 > n; n++) {
        for ((i = !!(e[Math.floor(n / 32)] & (1 << (31 - (n % 32))))) && (r = h(r, o)), l = !!(1 & o[3]), i = 3; 0 < i; i--) o[i] = (o[i] >>> 1) | ((1 & o[i - 1]) << 31);
        (o[0] >>>= 1), l && (o[0] ^= -520093696);
      }
      return r;
    },
    s: function (e, s, n) {
      var i,
        r = n.length;
      for (s = s.slice(0), i = 0; i < r; i += 4) (s[0] ^= 4294967295 & n[i]), (s[1] ^= 4294967295 & n[i + 1]), (s[2] ^= 4294967295 & n[i + 2]), (s[3] ^= 4294967295 & n[i + 3]), (s = sjcl.mode.gcm.ea(s, e));
      return s;
    },
    S: function (e, s, n, i, r, o) {
      var l,
        h,
        u,
        m,
        g,
        p,
        f,
        S,
        b = sjcl.bitArray;
      for (
        p = n.length,
          f = b.bitLength(n),
          S = b.bitLength(i),
          h = b.bitLength(r),
          l = s.encrypt([0, 0, 0, 0]),
          96 === h ? ((r = r.slice(0)), (r = b.concat(r, [1]))) : ((r = sjcl.mode.gcm.s(l, [0, 0, 0, 0], r)), (r = sjcl.mode.gcm.s(l, r, [0, 0, Math.floor(h / 4294967296), 4294967295 & h]))),
          h = sjcl.mode.gcm.s(l, [0, 0, 0, 0], i),
          g = r.slice(0),
          i = h.slice(0),
          e || (i = sjcl.mode.gcm.s(l, h, n)),
          m = 0;
        m < p;
        m += 4
      )
        g[3]++, (u = s.encrypt(g)), (n[m] ^= u[0]), (n[m + 1] ^= u[1]), (n[m + 2] ^= u[2]), (n[m + 3] ^= u[3]);
      return (
        (n = b.clamp(n, f)),
        e && (i = sjcl.mode.gcm.s(l, h, n)),
        (e = [Math.floor(S / 4294967296), 4294967295 & S, Math.floor(f / 4294967296), 4294967295 & f]),
        (i = sjcl.mode.gcm.s(l, i, e)),
        (u = s.encrypt(r)),
        (i[0] ^= u[0]),
        (i[1] ^= u[1]),
        (i[2] ^= u[2]),
        (i[3] ^= u[3]),
        { tag: b.bitSlice(i, 0, o), data: n }
      );
    },
  }),
  (sjcl.prng = function (e) {
    (this.j = [new sjcl.hash.sha256()]),
      (this.u = [0]),
      (this.M = 0),
      (this.D = {}),
      (this.K = 0),
      (this.R = {}),
      (this.W = this.l = this.v = this.da = 0),
      (this.b = [0, 0, 0, 0, 0, 0, 0, 0]),
      (this.o = [0, 0, 0, 0]),
      (this.I = void 0),
      (this.J = e),
      (this.B = !1),
      (this.H = { progress: {}, seeded: {} }),
      (this.A = this.ca = 0),
      (this.F = 1),
      (this.G = 2),
      (this.$ = 65536),
      (this.O = [0, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024]),
      (this.aa = 3e4),
      (this.Z = 80);
  }),
  (sjcl.prng.prototype = {
    randomWords: function (e, s) {
      var n,
        i,
        r = [];
      if ((n = this.isReady(s)) === this.A) throw new sjcl.exception.notReady("generator isn't seeded");
      if (n & this.G) {
        (n = !(n & this.F)), (i = []);
        var o,
          l = 0;
        for (this.W = i[0] = new Date().valueOf() + this.aa, o = 0; 16 > o; o++) i.push((4294967296 * Math.random()) | 0);
        for (o = 0; o < this.j.length && ((i = i.concat(this.j[o].finalize())), (l += this.u[o]), (this.u[o] = 0), n || !(this.M & (1 << o))); o++);
        for (
          this.M >= 1 << this.j.length && (this.j.push(new sjcl.hash.sha256()), this.u.push(0)),
            this.l -= l,
            l > this.v && (this.v = l),
            this.M++,
            this.b = sjcl.hash.sha256.hash(this.b.concat(i)),
            this.I = new sjcl.cipher.aes(this.b),
            n = 0;
          4 > n && ((this.o[n] = (this.o[n] + 1) | 0), !this.o[n]);
          n++
        );
      }
      for (n = 0; n < e; n += 4) 0 == (n + 1) % this.$ && v(this), (i = w(this)), r.push(i[0], i[1], i[2], i[3]);
      return v(this), r.slice(0, e);
    },
    setDefaultParanoia: function (e, s) {
      if (0 === e && "Setting paranoia=0 will ruin your security; use it only for testing" !== s) throw new sjcl.exception.invalid("Setting paranoia=0 will ruin your security; use it only for testing");
      this.J = e;
    },
    addEntropy: function (e, s, n) {
      n = n || "user";
      var i,
        r,
        o = new Date().valueOf(),
        l = this.D[n],
        h = this.isReady(),
        u = 0;
      switch ((void 0 === (i = this.R[n]) && (i = this.R[n] = this.da++), void 0 === l && (l = this.D[n] = 0), (this.D[n] = (this.D[n] + 1) % this.j.length), typeof e)) {
        case "number":
          void 0 === s && (s = 1), this.j[l].update([i, this.K++, 1, s, o, 1, 0 | e]);
          break;
        case "object":
          if ("[object Uint32Array]" === (n = Object.prototype.toString.call(e))) {
            for (r = [], n = 0; n < e.length; n++) r.push(e[n]);
            e = r;
          } else for ("[object Array]" !== n && (u = 1), n = 0; n < e.length && !u; n++) "number" != typeof e[n] && (u = 1);
          if (!u) {
            if (void 0 === s) for (n = s = 0; n < e.length; n++) for (r = e[n]; 0 < r; ) s++, (r >>>= 1);
            this.j[l].update([i, this.K++, 2, s, o, e.length].concat(e));
          }
          break;
        case "string":
          void 0 === s && (s = e.length), this.j[l].update([i, this.K++, 3, s, o, e.length]), this.j[l].update(e);
          break;
        default:
          u = 1;
      }
      if (u) throw new sjcl.exception.bug("random: addEntropy only supports number, array of numbers or string");
      (this.u[l] += s), (this.l += s), h === this.A && (this.isReady() !== this.A && z("seeded", Math.max(this.v, this.l)), z("progress", this.getProgress()));
    },
    isReady: function (e) {
      return (e = this.O[void 0 !== e ? e : this.J]), this.v && this.v >= e ? (this.u[0] > this.Z && new Date().valueOf() > this.W ? this.G | this.F : this.F) : this.l >= e ? this.G | this.A : this.A;
    },
    getProgress: function (e) {
      return (e = this.O[e || this.J]), this.v >= e || this.l > e ? 1 : this.l / e;
    },
    startCollectors: function () {
      if (!this.B) {
        if (((this.a = { loadTimeCollector: A(this, this.ha), mouseCollector: A(this, this.ia), keyboardCollector: A(this, this.ga), accelerometerCollector: A(this, this.ba), touchCollector: A(this, this.ja) }), window.addEventListener))
          window.addEventListener("load", this.a.loadTimeCollector, !1),
            window.addEventListener("mousemove", this.a.mouseCollector, !1),
            window.addEventListener("keypress", this.a.keyboardCollector, !1),
            window.addEventListener("devicemotion", this.a.accelerometerCollector, !1),
            window.addEventListener("touchmove", this.a.touchCollector, !1);
        else {
          if (!document.attachEvent) throw new sjcl.exception.bug("can't attach event");
          document.attachEvent("onload", this.a.loadTimeCollector), document.attachEvent("onmousemove", this.a.mouseCollector), document.attachEvent("keypress", this.a.keyboardCollector);
        }
        this.B = !0;
      }
    },
    stopCollectors: function () {
      this.B &&
        (window.removeEventListener
          ? (window.removeEventListener("load", this.a.loadTimeCollector, !1),
            window.removeEventListener("mousemove", this.a.mouseCollector, !1),
            window.removeEventListener("keypress", this.a.keyboardCollector, !1),
            window.removeEventListener("devicemotion", this.a.accelerometerCollector, !1),
            window.removeEventListener("touchmove", this.a.touchCollector, !1))
          : document.detachEvent && (document.detachEvent("onload", this.a.loadTimeCollector), document.detachEvent("onmousemove", this.a.mouseCollector), document.detachEvent("keypress", this.a.keyboardCollector)),
        (this.B = !1));
    },
    addEventListener: function (e, s) {
      this.H[e][this.ca++] = s;
    },
    removeEventListener: function (e, s) {
      var n,
        i,
        r = this.H[e],
        o = [];
      for (i in r) r.hasOwnProperty(i) && r[i] === s && o.push(i);
      for (n = 0; n < o.length; n++) delete r[(i = o[n])];
    },
    ga: function () {
      B(this, 1);
    },
    ia: function (e) {
      var s, n;
      try {
        (s = e.x || e.clientX || e.offsetX || 0), (n = e.y || e.clientY || e.offsetY || 0);
      } catch (e) {
        n = s = 0;
      }
      0 != s && 0 != n && this.addEntropy([s, n], 2, "mouse"), B(this, 0);
    },
    ja: function (e) {
      (e = e.touches[0] || e.changedTouches[0]), this.addEntropy([e.pageX || e.clientX, e.pageY || e.clientY], 1, "touch"), B(this, 0);
    },
    ha: function () {
      B(this, 2);
    },
    ba: function (e) {
      if (((e = e.accelerationIncludingGravity.x || e.accelerationIncludingGravity.y || e.accelerationIncludingGravity.z), window.orientation)) {
        var s = window.orientation;
        "number" == typeof s && this.addEntropy(s, 1, "accelerometer");
      }
      e && this.addEntropy(e, 2, "accelerometer"), B(this, 0);
    },
  }),
  (sjcl.random = new sjcl.prng(6));
e: try {
  var C, D, E, F;
  if ((F = "undefined" != typeof module && module.exports)) {
    var G;
    try {
      G = require("crypto");
    } catch (e) {
      G = null;
    }
    F = D = G;
  }
  if (F && D.randomBytes) (C = D.randomBytes(128)), (C = new Uint32Array(new Uint8Array(C).buffer)), sjcl.random.addEntropy(C, 1024, "crypto['randomBytes']");
  else if ("undefined" != typeof window && "undefined" != typeof Uint32Array) {
    if (((E = new Uint32Array(32)), window.crypto && window.crypto.getRandomValues)) window.crypto.getRandomValues(E);
    else {
      if (!window.msCrypto || !window.msCrypto.getRandomValues) break e;
      window.msCrypto.getRandomValues(E);
    }
    sjcl.random.addEntropy(E, 1024, "crypto['getRandomValues']");
  }
} catch (e) {
  "undefined" != typeof window && window.console;
}
(sjcl.bn = function (e) {
  this.initWith(e);
}),
  (sjcl.bn.prototype = {
    radix: 24,
    maxMul: 8,
    h: sjcl.bn,
    copy: function () {
      return new this.h(this);
    },
    initWith: function (e) {
      var s,
        n = 0;
      switch (typeof e) {
        case "object":
          this.limbs = e.limbs.slice(0);
          break;
        case "number":
          (this.limbs = [e]), this.normalize();
          break;
        case "string":
          for (e = e.replace(/^0x/, ""), this.limbs = [], s = this.radix / 4, n = 0; n < e.length; n += s) this.limbs.push(parseInt(e.substring(Math.max(e.length - n - s, 0), e.length - n), 16));
          break;
        default:
          this.limbs = [0];
      }
      return this;
    },
    equals: function (e) {
      "number" == typeof e && (e = new this.h(e));
      var s,
        n = 0;
      for (this.fullReduce(), e.fullReduce(), s = 0; s < this.limbs.length || s < e.limbs.length; s++) n |= this.getLimb(s) ^ e.getLimb(s);
      return 0 === n;
    },
    getLimb: function (e) {
      return e >= this.limbs.length ? 0 : this.limbs[e];
    },
    greaterEquals: function (e) {
      "number" == typeof e && (e = new this.h(e));
      var s,
        n,
        i,
        r = 0,
        o = 0;
      for (s = Math.max(this.limbs.length, e.limbs.length) - 1; 0 <= s; s--) r |= ((n = this.getLimb(s)) - (i = e.getLimb(s))) & ~(o |= (i - n) & ~r);
      return (o | ~r) >>> 31;
    },
    toString: function () {
      this.fullReduce();
      var e,
        s,
        n = "",
        i = this.limbs;
      for (e = 0; e < this.limbs.length; e++) {
        for (s = i[e].toString(16); e < this.limbs.length - 1 && 6 > s.length; ) s = "0" + s;
        n = s + n;
      }
      return "0x" + n;
    },
    addM: function (e) {
      "object" != typeof e && (e = new this.h(e));
      var s = this.limbs,
        n = e.limbs;
      for (e = s.length; e < n.length; e++) s[e] = 0;
      for (e = 0; e < n.length; e++) s[e] += n[e];
      return this;
    },
    doubleM: function () {
      var e,
        s,
        n = 0,
        i = this.radix,
        r = this.radixMask,
        o = this.limbs;
      for (e = 0; e < o.length; e++) (s = (s = o[e]) + s + n), (o[e] = s & r), (n = s >> i);
      return n && o.push(n), this;
    },
    halveM: function () {
      var e,
        s,
        n = 0,
        i = this.radix,
        r = this.limbs;
      for (e = r.length - 1; 0 <= e; e--) (s = r[e]), (r[e] = (s + n) >> 1), (n = (1 & s) << i);
      return r[r.length - 1] || r.pop(), this;
    },
    subM: function (e) {
      "object" != typeof e && (e = new this.h(e));
      var s = this.limbs,
        n = e.limbs;
      for (e = s.length; e < n.length; e++) s[e] = 0;
      for (e = 0; e < n.length; e++) s[e] -= n[e];
      return this;
    },
    mod: function (e) {
      var s = !this.greaterEquals(new sjcl.bn(0));
      e = new sjcl.bn(e).normalize();
      var n = new sjcl.bn(this).normalize(),
        i = 0;
      for (s && (n = new sjcl.bn(0).subM(n).normalize()); n.greaterEquals(e); i++) e.doubleM();
      for (s && (n = e.sub(n).normalize()); 0 < i; i--) e.halveM(), n.greaterEquals(e) && n.subM(e).normalize();
      return n.trim();
    },
    inverseMod: function (e) {
      var s,
        n = new sjcl.bn(1),
        i = new sjcl.bn(0),
        r = new sjcl.bn(this),
        o = new sjcl.bn(e),
        l = 1;
      if (!(1 & e.limbs[0])) throw new sjcl.exception.invalid("inverseMod: p must be odd");
      do {
        for (
          1 & r.limbs[0] && (r.greaterEquals(o) || ((s = r), (r = o), (o = s), (s = n), (n = i), (i = s)), r.subM(o), r.normalize(), n.greaterEquals(i) || n.addM(e), n.subM(i)),
            r.halveM(),
            1 & n.limbs[0] && n.addM(e),
            n.normalize(),
            n.halveM(),
            s = l = 0;
          s < r.limbs.length;
          s++
        )
          l |= r.limbs[s];
      } while (l);
      if (!o.equals(1)) throw new sjcl.exception.invalid("inverseMod: p and x must be relatively prime");
      return i;
    },
    add: function (e) {
      return this.copy().addM(e);
    },
    sub: function (e) {
      return this.copy().subM(e);
    },
    mul: function (e) {
      "number" == typeof e ? (e = new this.h(e)) : e.normalize(), this.normalize();
      var s,
        n,
        i = this.limbs,
        r = e.limbs,
        o = i.length,
        l = r.length,
        h = new this.h(),
        u = h.limbs,
        m = this.maxMul;
      for (s = 0; s < this.limbs.length + e.limbs.length + 1; s++) u[s] = 0;
      for (s = 0; s < o; s++) {
        for (n = i[s], e = 0; e < l; e++) u[s + e] += n * r[e];
        --m || ((m = this.maxMul), h.cnormalize());
      }
      return h.cnormalize().reduce();
    },
    square: function () {
      return this.mul(this);
    },
    power: function (e) {
      e = new sjcl.bn(e).normalize().trim().limbs;
      var s,
        n,
        i = new this.h(1),
        r = this;
      for (s = 0; s < e.length; s++) for (n = 0; n < this.radix && (e[s] & (1 << n) && (i = i.mul(r)), s != e.length - 1 || e[s] >> (n + 1)); n++) r = r.square();
      return i;
    },
    mulmod: function (e, s) {
      return this.mod(s).mul(e.mod(s)).mod(s);
    },
    powermod: function (e, s) {
      if (((e = new sjcl.bn(e)), !(1 & ~(s = new sjcl.bn(s)).limbs[0])) && 0 != (l = this.montpowermod(e, s))) return l;
      for (var n, i = e.normalize().trim().limbs, r = new this.h(1), o = this, l = 0; l < i.length; l++) for (n = 0; n < this.radix && (i[l] & (1 << n) && (r = r.mulmod(o, s)), l != i.length - 1 || i[l] >> (n + 1)); n++) o = o.mulmod(o, s);
      return r;
    },
    montpowermod: function (e, s) {
      function c(e, s) {
        var n = s % e.radix;
        return (e.limbs[Math.floor(s / e.radix)] & (1 << n)) >> n;
      }
      function d(e, n) {
        var i,
          l,
          u = (1 << (o + 1)) - 1;
        for (
          (l = (i = e.mul(n)).mul(p)).limbs = l.limbs.slice(0, r.limbs.length),
            l.limbs.length == r.limbs.length && (l.limbs[r.limbs.length - 1] &= u),
            l = l.mul(s),
            (l = i.add(l).normalize().trim()).limbs = l.limbs.slice(r.limbs.length - 1),
            i = 0;
          i < l.limbs.length;
          i++
        )
          0 < i && (l.limbs[i - 1] |= (l.limbs[i] & u) << (h - o - 1)), (l.limbs[i] >>= o + 1);
        return l.greaterEquals(s) && l.subM(s), l;
      }
      (e = new sjcl.bn(e).normalize().trim()), (s = new sjcl.bn(s));
      var n,
        i,
        r,
        o,
        l,
        h = this.radix,
        u = new this.h(1);
      for (
        n = this.copy(),
          l = e.bitLength(),
          r = new sjcl.bn({
            limbs: s
              .copy()
              .normalize()
              .trim()
              .limbs.map(function () {
                return 0;
              }),
          }),
          o = this.radix;
        0 < o;
        o--
      )
        if (1 == ((s.limbs[s.limbs.length - 1] >> o) & 1)) {
          r.limbs[r.limbs.length - 1] = 1 << o;
          break;
        }
      if (0 == l) return this;
      l = 18 > l ? 1 : 48 > l ? 3 : 144 > l ? 4 : 768 > l ? 5 : 6;
      var m = r.copy(),
        g = s.copy();
      i = new sjcl.bn(1);
      for (var p = new sjcl.bn(0), f = r.copy(); f.greaterEquals(1); ) f.halveM(), 1 & i.limbs[0] ? (i.addM(g), i.halveM(), p.halveM(), p.addM(m)) : (i.halveM(), p.halveM());
      if (((i = i.normalize()), (p = p.normalize()), m.doubleM(), (g = m.mulmod(m, s)), !m.mul(i).sub(s.mul(p)).equals(1))) return !1;
      for (n = d(n, g), u = d(u, g), i = (1 << (l - 1)) - 1, (m = {})[1] = n.copy(), m[2] = d(n, n), n = 1; n <= i; n++) m[2 * n + 1] = d(m[2 * n - 1], m[2]);
      for (n = e.bitLength() - 1; 0 <= n; )
        if (0 == c(e, n)) (u = d(u, u)), --n;
        else {
          for (g = n - l + 1; 0 == c(e, g); ) g++;
          for (f = 0, i = g; i <= n; i++) (f += c(e, i) << (i - g)), (u = d(u, u));
          (u = d(u, m[f])), (n = g - 1);
        }
      return d(u, 1);
    },
    trim: function () {
      var e,
        s = this.limbs;
      do {
        e = s.pop();
      } while (s.length && 0 === e);
      return s.push(e), this;
    },
    reduce: function () {
      return this;
    },
    fullReduce: function () {
      return this.normalize();
    },
    normalize: function () {
      var e,
        s = 0,
        n = this.placeVal,
        i = this.ipv,
        r = this.limbs,
        o = r.length,
        l = this.radixMask;
      for (e = 0; e < o || (0 !== s && -1 !== s); e++) s = ((s = (r[e] || 0) + s) - (r[e] = s & l)) * i;
      return -1 === s && (r[e - 1] -= n), this.trim(), this;
    },
    cnormalize: function () {
      var e,
        s = 0,
        n = this.ipv,
        i = this.limbs,
        r = i.length,
        o = this.radixMask;
      for (e = 0; e < r - 1; e++) s = ((s = i[e] + s) - (i[e] = s & o)) * n;
      return (i[e] += s), this;
    },
    toBits: function (e) {
      this.fullReduce(), (e = e || this.exponent || this.bitLength());
      var s = Math.floor((e - 1) / 24),
        n = sjcl.bitArray,
        i = [n.partial(((e + 7) & -8) % this.radix || this.radix, this.getLimb(s))];
      for (s--; 0 <= s; s--) (i = n.concat(i, [n.partial(Math.min(this.radix, e), this.getLimb(s))])), (e -= this.radix);
      return i;
    },
    bitLength: function () {
      this.fullReduce();
      for (var e = this.radix * (this.limbs.length - 1), s = this.limbs[this.limbs.length - 1]; s; s >>>= 1) e++;
      return (e + 7) & -8;
    },
  }),
  (sjcl.bn.fromBits = function (e) {
    var s = new this(),
      n = [],
      i = sjcl.bitArray,
      r = this.prototype,
      o = Math.min(this.bitLength || 4294967296, i.bitLength(e)),
      l = o % r.radix || r.radix;
    for (n[0] = i.extract(e, 0, l); l < o; l += r.radix) n.unshift(i.extract(e, l, r.radix));
    return (s.limbs = n), s;
  }),
  (sjcl.bn.prototype.ipv = 1 / (sjcl.bn.prototype.placeVal = Math.pow(2, sjcl.bn.prototype.radix))),
  (sjcl.bn.prototype.radixMask = (1 << sjcl.bn.prototype.radix) - 1),
  (sjcl.bn.pseudoMersennePrime = function (e, s) {
    function c(e) {
      this.initWith(e);
    }
    var n,
      i,
      r,
      o = (c.prototype = new sjcl.bn());
    for (
      r = o.modOffset = Math.ceil((i = e / o.radix)),
        o.exponent = e,
        o.offset = [],
        o.factor = [],
        o.minOffset = r,
        o.fullMask = 0,
        o.fullOffset = [],
        o.fullFactor = [],
        o.modulus = c.modulus = new sjcl.bn(Math.pow(2, e)),
        o.fullMask = 0 | -Math.pow(2, e % o.radix),
        n = 0;
      n < s.length;
      n++
    )
      (o.offset[n] = Math.floor(s[n][0] / o.radix - i)),
        (o.fullOffset[n] = Math.floor(s[n][0] / o.radix) - r + 1),
        (o.factor[n] = s[n][1] * Math.pow(0.5, e - s[n][0] + o.offset[n] * o.radix)),
        (o.fullFactor[n] = s[n][1] * Math.pow(0.5, e - s[n][0] + o.fullOffset[n] * o.radix)),
        o.modulus.addM(new sjcl.bn(Math.pow(2, s[n][0]) * s[n][1])),
        (o.minOffset = Math.min(o.minOffset, -o.offset[n]));
    return (
      (o.h = c),
      o.modulus.cnormalize(),
      (o.reduce = function () {
        var e,
          s,
          n,
          i,
          r = this.modOffset,
          o = this.limbs,
          l = this.offset,
          h = this.offset.length,
          u = this.factor;
        for (e = this.minOffset; o.length > r; ) {
          for (n = o.pop(), i = o.length, s = 0; s < h; s++) o[i + l[s]] -= u[s] * n;
          --e || (o.push(0), this.cnormalize(), (e = this.minOffset));
        }
        return this.cnormalize(), this;
      }),
      (o.Y =
        -1 === o.fullMask
          ? o.reduce
          : function () {
              var e,
                s,
                n = this.limbs,
                i = n.length - 1;
              if ((this.reduce(), i === this.modOffset - 1)) {
                for (s = n[i] & this.fullMask, n[i] -= s, e = 0; e < this.fullOffset.length; e++) n[i + this.fullOffset[e]] -= this.fullFactor[e] * s;
                this.normalize();
              }
            }),
      (o.fullReduce = function () {
        var e, s;
        for (this.Y(), this.addM(this.modulus), this.addM(this.modulus), this.normalize(), this.Y(), s = this.limbs.length; s < this.modOffset; s++) this.limbs[s] = 0;
        for (e = this.greaterEquals(this.modulus), s = 0; s < this.limbs.length; s++) this.limbs[s] -= this.modulus.limbs[s] * e;
        return this.cnormalize(), this;
      }),
      (o.inverse = function () {
        return this.power(this.modulus.sub(2));
      }),
      (c.fromBits = sjcl.bn.fromBits),
      c
    );
  });
var H = sjcl.bn.pseudoMersennePrime;
(sjcl.bn.prime = {
  p127: H(127, [[0, -1]]),
  p25519: H(255, [[0, -19]]),
  p192k: H(192, [
    [32, -1],
    [12, -1],
    [8, -1],
    [7, -1],
    [6, -1],
    [3, -1],
    [0, -1],
  ]),
  p224k: H(224, [
    [32, -1],
    [12, -1],
    [11, -1],
    [9, -1],
    [7, -1],
    [4, -1],
    [1, -1],
    [0, -1],
  ]),
  p256k: H(256, [
    [32, -1],
    [9, -1],
    [8, -1],
    [7, -1],
    [6, -1],
    [4, -1],
    [0, -1],
  ]),
  p192: H(192, [
    [0, -1],
    [64, -1],
  ]),
  p224: H(224, [
    [0, 1],
    [96, -1],
  ]),
  p256: H(256, [
    [0, -1],
    [96, 1],
    [192, 1],
    [224, -1],
  ]),
  p384: H(384, [
    [0, -1],
    [32, 1],
    [96, -1],
    [128, -1],
  ]),
  p521: H(521, [[0, -1]]),
}),
  (sjcl.bn.random = function (e, s) {
    "object" != typeof e && (e = new sjcl.bn(e));
    for (var n, i, r = e.limbs.length, o = e.limbs[r - 1] + 1, l = new sjcl.bn(); ; ) {
      do {
        0 > (n = sjcl.random.randomWords(r, s))[r - 1] && (n[r - 1] += 4294967296);
      } while (Math.floor(n[r - 1] / o) === Math.floor(4294967296 / o));
      for (n[r - 1] %= o, i = 0; i < r - 1; i++) n[i] &= e.radixMask;
      if (((l.limbs = n), !l.greaterEquals(e))) return l;
    }
  }),
  (sjcl.keyexchange.srp = {
    makeVerifier: function (e, s, n, i) {
      return (e = sjcl.keyexchange.srp.makeX(e, s, n)), (e = sjcl.bn.fromBits(e)), i.g.powermod(e, i.N);
    },
    makeX: function (e, s, n) {
      return (e = sjcl.hash.sha1.hash(e + ":" + s)), sjcl.hash.sha1.hash(sjcl.bitArray.concat(n, e));
    },
    knownGroup: function (e) {
      return "string" != typeof e && (e = e.toString()), sjcl.keyexchange.srp.T || sjcl.keyexchange.srp.fa(), sjcl.keyexchange.srp.V[e];
    },
    T: !1,
    fa: function () {
      var e, s;
      for (e = 0; e < sjcl.keyexchange.srp.U.length; e++) (s = sjcl.keyexchange.srp.U[e].toString()), ((s = sjcl.keyexchange.srp.V[s]).N = new sjcl.bn(s.N)), (s.g = new sjcl.bn(s.g));
      sjcl.keyexchange.srp.T = !0;
    },
    U: [1024, 1536, 2048, 3072, 4096, 6144, 8192],
    V: {
      1024: {
        N:
          "EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C9C256576D674DF7496EA81D3383B4813D692C6E0E0D5D8E250B98BE48E495C1D6089DAD15DC7D7B46154D6B6CE8EF4AD69B15D4982559B297BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA9AFD5138FE8376435B9FC61D2FC0EB06E3",
        g: 2,
      },
      1536: {
        N:
          "9DEF3CAFB939277AB1F12A8617A47BBBDBA51DF499AC4C80BEEEA9614B19CC4D5F4F5F556E27CBDE51C6A94BE4607A291558903BA0D0F84380B655BB9A22E8DCDF028A7CEC67F0D08134B1C8B97989149B609E0BE3BAB63D47548381DBC5B1FC764E3F4B53DD9DA1158BFD3E2B9C8CF56EDF019539349627DB2FD53D24B7C48665772E437D6C7F8CE442734AF7CCB7AE837C264AE3A9BEB87F8A2FE9B8B5292E5A021FFF5E91479E8CE7A28C2442C6F315180F93499A234DCF76E3FED135F9BB",
        g: 2,
      },
      2048: {
        N:
          "AC6BDB41324A9A9BF166DE5E1389582FAF72B6651987EE07FC3192943DB56050A37329CBB4A099ED8193E0757767A13DD52312AB4B03310DCD7F48A9DA04FD50E8083969EDB767B0CF6095179A163AB3661A05FBD5FAAAE82918A9962F0B93B855F97993EC975EEAA80D740ADBF4FF747359D041D5C33EA71D281E446B14773BCA97B43A23FB801676BD207A436C6481F1D2B9078717461A5B9D32E688F87748544523B524B0D57D5EA77A2775D2ECFA032CFBDBF52FB3786160279004E57AE6AF874E7303CE53299CCC041C7BC308D82A5698F3A8D0C38271AE35F8E9DBFBB694B5C803D89F7AE435DE236D525F54759B65E372FCD68EF20FA7111F9E4AFF73",
        g: 2,
      },
      3072: {
        N:
          "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200CBBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF",
        g: 5,
      },
      4096: {
        N:
          "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200CBBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFCE0FD108E4B82D120A92108011A723C12A787E6D788719A10BDBA5B2699C327186AF4E23C1A946834B6150BDA2583E9CA2AD44CE8DBBBC2DB04DE8EF92E8EFC141FBECAA6287C59474E6BC05D99B2964FA090C3A2233BA186515BE7ED1F612970CEE2D7AFB81BDD762170481CD0069127D5B05AA993B4EA988D8FDDC186FFB7DC90A6C08F4DF435C934063199FFFFFFFFFFFFFFFF",
        g: 5,
      },
      6144: {
        N:
          "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200CBBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFCE0FD108E4B82D120A92108011A723C12A787E6D788719A10BDBA5B2699C327186AF4E23C1A946834B6150BDA2583E9CA2AD44CE8DBBBC2DB04DE8EF92E8EFC141FBECAA6287C59474E6BC05D99B2964FA090C3A2233BA186515BE7ED1F612970CEE2D7AFB81BDD762170481CD0069127D5B05AA993B4EA988D8FDDC186FFB7DC90A6C08F4DF435C93402849236C3FAB4D27C7026C1D4DCB2602646DEC9751E763DBA37BDF8FF9406AD9E530EE5DB382F413001AEB06A53ED9027D831179727B0865A8918DA3EDBEBCF9B14ED44CE6CBACED4BB1BDB7F1447E6CC254B332051512BD7AF426FB8F401378CD2BF5983CA01C64B92ECF032EA15D1721D03F482D7CE6E74FEF6D55E702F46980C82B5A84031900B1C9E59E7C97FBEC7E8F323A97A7E36CC88BE0F1D45B7FF585AC54BD407B22B4154AACC8F6D7EBF48E1D814CC5ED20F8037E0A79715EEF29BE32806A1D58BB7C5DA76F550AA3D8A1FBFF0EB19CCB1A313D55CDA56C9EC2EF29632387FE8D76E3C0468043E8F663F4860EE12BF2D5B0B7474D6E694F91E6DCC4024FFFFFFFFFFFFFFFF",
        g: 5,
      },
      8192: {
        N:
          "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200CBBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFCE0FD108E4B82D120A92108011A723C12A787E6D788719A10BDBA5B2699C327186AF4E23C1A946834B6150BDA2583E9CA2AD44CE8DBBBC2DB04DE8EF92E8EFC141FBECAA6287C59474E6BC05D99B2964FA090C3A2233BA186515BE7ED1F612970CEE2D7AFB81BDD762170481CD0069127D5B05AA993B4EA988D8FDDC186FFB7DC90A6C08F4DF435C93402849236C3FAB4D27C7026C1D4DCB2602646DEC9751E763DBA37BDF8FF9406AD9E530EE5DB382F413001AEB06A53ED9027D831179727B0865A8918DA3EDBEBCF9B14ED44CE6CBACED4BB1BDB7F1447E6CC254B332051512BD7AF426FB8F401378CD2BF5983CA01C64B92ECF032EA15D1721D03F482D7CE6E74FEF6D55E702F46980C82B5A84031900B1C9E59E7C97FBEC7E8F323A97A7E36CC88BE0F1D45B7FF585AC54BD407B22B4154AACC8F6D7EBF48E1D814CC5ED20F8037E0A79715EEF29BE32806A1D58BB7C5DA76F550AA3D8A1FBFF0EB19CCB1A313D55CDA56C9EC2EF29632387FE8D76E3C0468043E8F663F4860EE12BF2D5B0B7474D6E694F91E6DBE115974A3926F12FEE5E438777CB6A932DF8CD8BEC4D073B931BA3BC832B68D9DD300741FA7BF8AFC47ED2576F6936BA424663AAB639C5AE4F5683423B4742BF1C978238F16CBE39D652DE3FDB8BEFC848AD922222E04A4037C0713EB57A81A23F0C73473FC646CEA306B4BCBC8862F8385DDFA9D4B7FA2C087E879683303ED5BDD3A062B3CF5B3A278A66D2A13F83F44F82DDF310EE074AB6A364597E899A0255DC164F31CC50846851DF9AB48195DED7EA1B1D510BD7EE74D73FAF36BC31ECFA268359046F4EB879F924009438B481C6CD7889A002ED5EE382BC9190DA6FC026E479558E4475677E9AA9E3050E2765694DFC81F56E880B96E7160C980DD98EDD3DFFFFFFFFFFFFFFFFF",
        g: 19,
      },
    },
  }),
  "undefined" != typeof module && module.exports && (module.exports = sjcl),
  "function" == typeof define &&
    define([], function () {
      return sjcl;
    });
var pwlog = void 0,
  pwerror = void 0;
function isStringEmpty(e) {
  return !e || 0 === e.length;
}
function urlFromURLString(e) {
  try {
    return new URL(e);
  } catch {
    return null;
  }
}
const WindowsVersion = { Higher: "Higher", Eleven: "Eleven", Ten: "Ten", Vista: "Vista", XPOrLower: "XPOrLower", NotWindows: "NotWindows", Other: "Other" };
function versionOfWindowsFromUserAgentIfRunningOnWindows() {
  const e = new RegExp("\\(Windows\\s*\\w*\\s*(\\d*)\\.(\\d*)", "i").exec(navigator.userAgent);
  return null === e || 3 !== e.length
    ? WindowsVersion.NotWindows
    : e[1] > 11
    ? WindowsVersion.Higher
    : 11 === e[1]
    ? WindowsVersion.Eleven
    : 10 === e[1]
    ? WindowsVersion.Ten
    : e[1] < 6
    ? WindowsVersion.XPOrLower
    : e[2] < 1
    ? WindowsVersion.Vista
    : WindowsVersion.Other;
}
function humanReadableFormType(e) {
  switch (e) {
    case WBSAutoFillFormTypeUndetermined:
      return "Undetermined";
    case WBSAutoFillFormTypeAutoFillableStandard:
      return "AutoFillable:Standard";
    case WBSAutoFillFormTypeNonAutoFillable:
      return "NonAutoFillable";
    case WBSAutoFillFormTypeAutoFillableLogin:
      return "AutoFillable:Login";
    case WBSAutoFillFormTypeNewAccount:
      return "NewAccount";
    case WBSAutoFillFormTypeChangePassword:
      return "ChangePassword";
    case WBSAutoFillFormTypeFoundTOTPURI:
      return "FoundTOTPUri";
  }
  return "Unrecognized";
}
function domainsForDisplayFromUsernamesAndDomains(e, s) {
  const n = e.length;
  let i = s.map(function (e) {
      return e.replace(/^(www|m)\./, "");
    }),
    r = [];
  for (var o = 0; o < n; o++) r.push([e[o], i[o]]);
  for (o = 0; o < n; o++) {
    let e = [];
    for (var l = o + 1; l < n; l++) r[o].join("\n") === r[l].join("\n") && (e.length || e.push(o), e.push(l));
    for (let n of e) i[n] = s[n];
  }
  return i;
}
function urlIsBrowserURL(e) {
  const s = e.protocol;
  return "chrome:" === s || "edge:" === s || "about:" === s;
}
function isExtensionContextInvalidatedError(e) {
  return "Extension context invalidated." === e.message;
}
function capabilitiesDeclaresMacOS(e) {
  try {
    return "macos" === e.operatingSystem.name;
  } catch {
    return !1;
  }
}
class Localizer {
  static configureDocumentElementForLanguage(e, s) {
    switch (s) {
      case "he":
      case "ar":
      case "fa":
        e.setAttribute("dir", "rtl"), e.setAttribute("lang", s);
    }
  }
  #e = {};
  constructor(e) {
    e && (this.#e = e.operatingSystem);
  }
  getMessage(e, s, n) {
    const i = this.messageNamesToTry(e);
    for (let e of i) {
      let i;
      try {
        i = chrome.i18n.getMessage(e, s, n);
      } catch {
        i = chrome.i18n.getMessage(e, s);
      }
      if (i) return i;
    }
    return "";
  }
  messageNamesToTry(e) {
    let s = [];
    const n = this.#e,
      i = n ? n.name : void 0,
      r = n ? n.majorVersion : void 0,
      o = n ? n.minorVersion : void 0,
      l = void 0 !== r;
    return i && l && void 0 !== o && s.push(`${e}_${i}_${r}_${o}`), i && l && s.push(`${e}_${i}_${r}`), i ? s.push(`${e}_${i}`) : s.push(`${e}_${this.#t}`), s.push(e), s;
  }
  get #t() {
    return navigator.platform.startsWith("Mac") ? "macos" : "windows";
  }
}
class ExtensionSettings {
  #s = !1;
  #n = !0;
  #i = !0;
  eventTarget = new EventTarget();
  constructor(e = !1) {
    (this.#s = e), this.#r(), this.#o();
  }
  get enableInPageAutoFill() {
    return this.#n;
  }
  set enableInPageAutoFill(e) {
    (this.#n = e), this.#a();
  }
  get allowExtensionToControlAutoFillSettings() {
    return this.#i;
  }
  set allowExtensionToControlAutoFillSettings(e) {
    (this.#i = e), this.#l().then(this.#a.bind(this));
  }
  #l() {
    return this.#i ? this.attemptToControlBrowserAutoFillSettings() : this.clearControlOfBrowserAutoFillSettings();
  }
  async attemptToControlBrowserAutoFillSettings() {
    if (this.#s) throw new Error("This Settings instance does not allow writing browser settings");
    const e = await Promise.allSettled([this.#c(chrome.privacy.services.passwordSavingEnabled, !1), this.#c(chrome.privacy.services.autofillCreditCardEnabled, !1), this.#c(chrome.privacy.services.autofillAddressEnabled, !1)]);
    return this.#d(), e;
  }
  async clearControlOfBrowserAutoFillSettings() {
    if (this.#s) throw new Error("This Settings instance does not allow writing browser settings");
    const e = await Promise.allSettled([this.#h(chrome.privacy.services.passwordSavingEnabled), this.#h(chrome.privacy.services.autofillCreditCardEnabled), this.#h(chrome.privacy.services.autofillAddressEnabled)]);
    return this.#d(), e;
  }
  #r() {
    let e = new Promise((e) => {
      chrome.storage.sync.get({ enableInPageAutoFill: !0, allowExtensionToControlAutoFillSettings: !0 }, (s) => {
        (this.#n = s.enableInPageAutoFill), (this.#i = s.allowExtensionToControlAutoFillSettings), e();
      });
    });
    return this.#s || (e = e.then(this.#l.bind(this))), e.then(this.#d.bind(this));
  }
  #a() {
    return new Promise((e) => {
      chrome.storage.sync.set({ enableInPageAutoFill: this.#n, allowExtensionToControlAutoFillSettings: this.#i }, e);
    }).then(this.#d.bind(this));
  }
  #o() {
    this.#s ||
      (chrome.privacy.services.passwordSavingEnabled &&
        chrome.privacy.services.passwordSavingEnabled.onChange.addListener((e) => {
          this.#d();
        }),
      chrome.privacy.services.autofillCreditCardEnabled &&
        chrome.privacy.services.autofillCreditCardEnabled.onChange.addListener((e) => {
          this.#d();
        }),
      chrome.privacy.services.autofillAddressEnabled &&
        chrome.privacy.services.autofillAddressEnabled.onChange.addListener((e) => {
          this.#d();
        }));
  }
  #d() {
    const e = new CustomEvent("settingsChanged", { detail: { enableInPageAutoFill: this.#n } });
    this.eventTarget.dispatchEvent(e);
  }
  async #c(e, s) {
    let n;
    try {
      n = await this.#u(e);
    } catch (e) {
      return;
    }
    if (n) {
      if (n.value === s) return { details: n, newValue: s };
      try {
        n = await e.set({ value: s });
      } catch (e) {
        return;
      }
      return { details: n, newValue: s };
    }
  }
  async #u(e) {
    if (!e) throw new Error(`Unable to get ${e} setting.`);
    const s = await e.get({});
    if ("not_controllable" === s.levelOfControl) throw new Error(`Cannot control ${e} setting.`);
    return s;
  }
  async #h(e) {
    if (!e) throw new Error(`Unable to clear browser setting: ${e}.`);
    await e.clear({});
  }
}
const ErrCodes = {
  ErrSuccess: "Success",
  InvalidMessage: "InvalidMessage",
  UnexpectedMessage: "UnexpectedMessage",
  InvalidSyntax: "InvalidSyntax",
  InvalidSessionKey: "InvalidSessionKey",
  CryptoError: "CryptoError",
  InvalidUserName: "InvalidUserName",
};
class SecretSessionError extends Error {
  constructor(e, s = null) {
    super(s), (this.code = e);
  }
}
const SecretSessionVersion = { SRPWithOldVerification: 0, SRPWithRFCVerification: 1 },
  scriptVersion = "1.0",
  appVersion = "1.0",
  MSGTypes = { MSG0: 0, MSG1: 1, MSG2: 2, MSG3: 3 };
let SecretSession = function (e) {
  (this.shouldUseBase64 = !1),
    e.shouldUseBase64 && (this.shouldUseBase64 = e.shouldUseBase64),
    (this.protocolVersion = SecretSessionVersion.SRPWithOldVerification),
    e.secretSessionVersion && (this.protocolVersion = e.secretSessionVersion),
    (this.grp = sjcl.keyexchange.srp.knownGroup(3072)),
    (this.keyLen = 128),
    (this.tagLen = 128),
    this.setUpSRP();
};
SecretSession.prototype = {
  createSMSG: function (e) {
    if ("object" == typeof e)
      try {
        e = JSON.stringify(e);
      } catch (e) {
        return ErrCodes.InvalidMessage;
      }
    const s = sjcl.codec.utf8String.toBits(e),
      n = this.encrypt(s);
    if ("string" == typeof n) return n;
    let i = null;
    try {
      i = JSON.stringify({ TID: this.bitsToString(this.I.toBits()), SDATA: this.bitsToString(n, !1) });
    } catch (e) {
      return ErrCodes.InvalidMessage;
    }
    return i;
  },
  parseSMSG: function (e) {
    let s = e;
    if ("string" == typeof s)
      try {
        s = JSON.parse(e);
      } catch (s) {
        throw new SecretSessionError(ErrCodes.InvalidSyntax, `Unable to decode SMSG from string: ${s} ${e}`);
      }
    if ("string" != typeof s.SDATA) throw new SecretSessionError(ErrCodes.InvalidMessage, "Missing or invalid SDATA field in SMSG message.");
    if ("string" != typeof s.TID) throw new SecretSessionError(ErrCodes.InvalidUserName, "Missing or invalid 'TID' field in SMSG object.");
    const n = sjcl.bn.fromBits(this.stringToBits(s.TID));
    if (!this.I.equals(n)) throw new SecretSessionError(ErrCodes.InvalidUserName, "Received SMSG message meant for another session.");
    return sjcl.codec.utf8String.fromBits(this.decrypt(this.stringToBits(s.SDATA)));
  },
  setPin: function (e) {
    this.P = e;
  },
  stringToBase64: function (e) {
    let s = sjcl.codec.utf8String.toBits(e);
    return sjcl.codec.base64.fromBits(s, !1, !1);
  },
  bitsToString: function (e, s = !0) {
    return this.shouldUseBase64 ? sjcl.codec.base64.fromBits(e) : (s ? "0x" : "") + sjcl.codec.hex.fromBits(e);
  },
  stringToBits: function (e) {
    return this.shouldUseBase64 ? sjcl.codec.base64.toBits(e) : sjcl.codec.hex.toBits(e);
  },
  setUpSRP: function () {
    (this.I = sjcl.bn.fromBits(this._randomWords(4))), (this.a = sjcl.bn.fromBits(this._randomWords(8))), (this.A = this.grp.g.powermod(this.a, this.grp.N));
  },
  currProtocols: function () {
    return [SecretSessionVersion.SRPWithOldVerification, SecretSessionVersion.SRPWithRFCVerification];
  },
  initialMessage: function () {
    this.expectedMessage = MSGTypes.MSG1;
    let e = null;
    try {
      e = JSON.stringify({ TID: this.bitsToString(this.I.toBits()), MSG: 0, A: this.bitsToString(this.A.toBits()), VER: "1.0", PROTO: this.currProtocols() });
    } catch (e) {
      return null;
    }
    return this.stringToBase64(e);
  },
  _padToModulusLength: function (e) {
    e = e.replace(/^0x/, "");
    const s = 2 * ((sjcl.bitArray.bitLength(this.grp.N.toBits()) + 7) >> 3) - e.length;
    if (0 === s) return e;
    return "0".repeat(s) + e;
  },
  processMessage: function (e) {
    const s = sjcl.codec.utf8String.fromBits(sjcl.codec.base64.toBits(e));
    let n = null;
    try {
      n = JSON.parse(s);
    } catch (e) {
      throw new SecretSessionError(ErrCodes.InvalidMessage, `Unable to parse JSON message: ${e}`);
    }
    if ("string" != typeof n.TID) throw new SecretSessionError(ErrCodes.InvalidMessage, "Missing or invalid 'TID' field in PAKE message.");
    let i = sjcl.bn.fromBits(this.stringToBits(n.TID));
    if (!this.I.equals(i)) throw new SecretSessionError(ErrCodes.UnexpectedMessage, "Unexpected message");
    if (!n.MSG) throw new SecretSessionError(ErrCodes.InvalidMessage, "Missing 'MSG' field in PAKE message.");
    const r = parseInt(n.MSG, 10);
    if (this.expectedMessage !== r) throw new SecretSessionError(ErrCodes.UnexpectedMessage, `Received Message ${message.MSG}, but expected Message ${this.expectedMessage} `);
    let o = null;
    if (r === MSGTypes.MSG1) {
      var l = SecretSessionVersion.SRPWithOldVerification;
      "number" == typeof n.PROTO && ((l = n.PROTO), Object.values(SecretSessionVersion).includes(l) || (l = SecretSessionVersion.SRPWithOldVerification)), (this.protocolVersion = l), (o = this.processMessage1(n));
    } else r === MSGTypes.MSG3 && (o = this.processMessage3(n));
    return o;
  },
  createSessionKey: function (e, s) {
    const n = sjcl.hash.sha256.hash,
      i = this._calculateX(e, this.bitsToString(this.I.toBits()), this.P, n);
    this.v = this._calculateVerifier(this.grp.g, i, this.grp.N);
    const r = this.A.toString(),
      o = s.toString(),
      l = this._padToModulusLength(r).concat(this._padToModulusLength(o)),
      h = sjcl.bn.fromBits(n(sjcl.codec.hex.toBits(l))),
      u = this.a.add(h.mul(i)),
      m = this.grp.N.toString() + this._padToModulusLength(this.grp.g.toString()),
      g = sjcl.bn.fromBits(n(sjcl.codec.hex.toBits(m))).mulmod(this.v, this.grp.N);
    return n(s.sub(g).powermod(u, this.grp.N).toBits());
  },
  _calculateX: function (e, s, n, i) {
    const r = i(s + ":" + n);
    return sjcl.bn.fromBits(i(e.concat(r)));
  },
  _calculateVerifier: function (e, s, n) {
    return e.powermod(s, n);
  },
  _calculateM: function (e, s, n) {
    const i = sjcl.hash.sha256.hash;
    let r = i(this.grp.N.toBits()),
      o = i(sjcl.codec.hex.toBits(this._padToModulusLength(this.grp.g.toString())));
    const l = sjcl.bitArray.bitLength(r) / 32;
    for (let e = 0; e < l; ++e) r[e] = r[e] ^ o[e];
    let h = i(this.bitsToString(this.I.toBits())),
      u = new sjcl.hash.sha256();
    u.update(r), u.update(h), u.update(e), u.update(this.A.toBits()), u.update(s.toBits()), u.update(n);
    let m = u.finalize();
    return (u = new sjcl.hash.sha256()), u.update(this.A.toBits()), u.update(m), u.update(n), (this.hamk = u.finalize()), m;
  },
  processMessage1: function (e) {
    if ("string" != typeof e.s || "string" != typeof e.B) throw new SecretSessionError(ErrCodes.InvalidMessage, "Message 1 is missing some required keys.");
    e.VER && (this.appVer = e.VER);
    const s = this.stringToBits(e.s),
      n = sjcl.bn.fromBits(this.stringToBits(e.B));
    let i = new sjcl.bn(1);
    if (0 === n.mulmod(i, this.grp.N)) throw new SecretSessionError(ErrCodes.CryptoError, "B.mulmod error");
    const r = this.createSessionKey(s, n);
    (this.encKey = sjcl.bitArray.bitSlice(r, 0, this.keyLen)), (this.expectedMessage = MSGTypes.MSG3);
    let o = { TID: this.bitsToString(this.I.toBits()), MSG: 2 };
    switch (this.protocolVersion) {
      case SecretSessionVersion.SRPWithRFCVerification:
        o.M = this.bitsToString(this._calculateM(s, n, r), !1);
        break;
      case SecretSessionVersion.SRPWithOldVerification:
        const e = this.shouldUseBase64 ? this.v.toBits() : sjcl.codec.utf8String.toBits(this.v.toString()),
          i = this.encrypt(e);
        o.v = this.bitsToString(i, !1);
        break;
      default:
        throw new SecretSessionError(ErrCodes.UnexpectedMessage, `Unknown protocol version ${this.protocolVersion}`);
    }
    let l = null;
    try {
      l = JSON.stringify(o);
    } catch (e) {
      throw new SecretSessionError(ErrCodes.InvalidMessage, `Error encoding Message 2 to string:${e}`);
    }
    return this.stringToBase64(l);
  },
  processMessage3: function (e) {
    let s = ErrCodes.ErrSuccess,
      n = "";
    if (0 !== e.ErrCode) (n = `Message 3 contained an error: ${e.ErrCode}`), (s = ErrCodes.InvalidMessage);
    else
      switch (this.protocolVersion) {
        case SecretSessionVersion.SRPWithRFCVerification:
          if (e.HAMK) {
            const i = this.stringToBits(e.HAMK);
            sjcl.bitArray.equal(i, this.hamk) || ((n = "Failed to verify server data."), (this.msgExp = MSGTypes.MSG1), (s = ErrCodes.InvalidSessionKey));
          } else (n = `Message 3 does not contain necessary data:${e.ErrCode}`), (s = ErrCodes.InvalidMessage);
          break;
        case SecretSessionVersion.SRPWithOldVerification:
          break;
        default:
          (s = ErrCode.UnexpectedMessage), (n = `Unknown SecretSessionVersion ${this.protocolVersion}.`);
      }
    if (s !== ErrCodes.ErrSuccess) throw ((this.sessionKey = null), (this.expectedMessage = MSGTypes.MSG1), new SecretSessionError(s, n));
    return s === ErrCodes.ErrSuccess;
  },
  encrypt: function (e) {
    if (!this.encKey) throw new SecretSessionError(ErrCodes.InvalidSessionKey, "Called encrypt() without a session key");
    const s = new sjcl.cipher.aes(this.encKey),
      n = this._randomWords(4);
    let i = null;
    try {
      i = sjcl.mode.gcm.encrypt(s, e, n);
    } catch (e) {
      throw new SecretSessionError(ErrCodes.CryptoError, e.message);
    }
    return sjcl.bitArray.concat(i, n);
  },
  decrypt: function (e) {
    if (!this.encKey) throw new SecretSessionError(ErrCodes.InvalidSessionKey, "Called decrypt() without a session key!");
    const s = new sjcl.cipher.aes(this.encKey),
      n = sjcl.bitArray.bitSlice(e, 0, this.keyLen),
      i = sjcl.bitArray.bitSlice(e, this.keyLen);
    let r = null;
    try {
      r = sjcl.mode.gcm.decrypt(s, i, n);
    } catch (e) {
      throw new SecretSessionError(ErrCodes.CryptoError, `Exception while decrypting message. ${e}`);
    }
    return r;
  },
  _randomWords: function (e) {
    const s = new Int32Array(e);
    return self.crypto.getRandomValues(s), Array.from(s);
  },
};
const ContextState = {
    IncompatibleOS: "IncompatibleOS",
    NotInSession: "NotInSession",
    NativeSupportNotInstalled: "NativeSupportNotInstalled",
    CheckEngine: "CheckEngine",
    ChallengeSent: "ChallengeSent",
    MSG1Set: "MSG1Set",
    SessionKeySet: "SessionKeySet",
  },
  DataState = { Initial: "Initial", Frame0Processed: "Frame0Processed", DataProcessed: "DataProcessed" },
  RememberIC = { NoValueSet: "NoValueSet", UnknownPage: "UnknownPage", DoNotRemember: "DoNotRemember", RememberLoginAndPassword: "RememberLoginAndPassword" },
  WBSAutoFillFormTypeUndetermined = 0,
  WBSAutoFillFormTypeAutoFillableStandard = 1,
  WBSAutoFillFormTypeNonAutoFillable = 2,
  WBSAutoFillFormTypeAutoFillableLogin = 3,
  WBSAutoFillFormTypeNewAccount = 4,
  WBSAutoFillFormTypeChangePassword = 5,
  WBSAutoFillFormTypeFoundTOTPURI = 6;
class FrameDoesNotExistError extends Error {
  frame;
  constructor(e) {
    super(`Frame ${e.id} does not exist in tab ${e.tab.id}`), (this.frame = e);
  }
}
class FrameIsBrowserFrameError extends Error {
  frame;
  constructor(e) {
    super(`Frame ${e.id} in tab ${e.tab.id} is a browser frame.`), (this.frame = e);
  }
}
class ContentScriptNotSetUpInFrame extends Error {
  frame;
  constructor(e) {
    super(`Frame ${e.id} in tab ${e.tab.id} does not have active content script.`), (this.frame = e);
  }
}
class PromiseFulfillment {
  resolve;
  reject;
  constructor(e, s) {
    (this.resolve = e), (this.reject = s);
  }
}
class DelayedMessageSender {
  static defaultDelayMS = 50;
  delayMS;
  messageName;
  #m = null;
  #g = [];
  #p = null;
  constructor(e, s = DelayedMessageSender.defaultDelayMS) {
    (this.messageName = e), (this.delayMS = s);
  }
  get dateOfLastSentMessage() {
    return this.#p;
  }
  enqueueRequest(e, s) {
    return new Promise((n, i) => {
      this.#g.push(new PromiseFulfillment(n, i)),
        this.#m && (clearTimeout(this.#m), (this.#m = null)),
        (this.#m = setTimeout(
          (async () => {
            const n = e.tab.id,
              i = e.id;
            let r;
            try {
              r = await this.#C(n, i, this.messageName, s);
            } catch (s) {
              let n = s;
              return s.message.includes("Receiving end does not exist.") && (n = new FrameDoesNotExistError(e)), (this.#p = null), void this.#f(null, n);
            } finally {
              this.#m = null;
            }
            (this.#p = new Date()), this.#f(r);
          }).bind(this),
          this.delayMS
        ));
    });
  }
  cancelPendingRequests() {
    this.#m && (clearTimeout(this.#m), (this.#m = null)), this.#f(null, new Error("Cancelled"));
  }
  reset() {
    this.cancelPendingRequests(), (this.#p = null);
  }
  #C(e, s, n, i) {
    let r = { subject: n };
    return i && (r = { ...r, ...i }), chrome.tabs.sendMessage(e, r, { frameId: s });
  }
  #f(e, s = null) {
    for (; this.#g.length; ) {
      const n = this.#g.shift();
      s ? n.reject(s) : n.resolve(e);
    }
  }
}
class Frame {
  static delayForSettingUpContentScriptAfterFrameCreationMS = 50;
  static delayForRunningHeuristicsAfterFrameUpdateMS = 50;
  id;
  tab;
  url;
  state;
  #F = new DelayedMessageSender("setUp", Frame.delayForSettingUpContentScriptAfterFrameCreationMS);
  #S = new DelayedMessageSender("runFormMetadataHeuristics", Frame.delayForRunningHeuristicsAfterFrameUpdateMS);
  constructor(e, s) {
    (this.id = e), (this.tab = s);
  }
  get isBrowserFrame() {
    const e = this.url;
    return !!e && urlIsBrowserURL(e);
  }
  get hasCompletedLoad() {
    return "complete" === this.state;
  }
  get hasSetUpContentScript() {
    return !!this.#F.dateOfLastSentMessage;
  }
  prepareForRemoval() {
    this.#F.cancelPendingRequests(), this.#S.cancelPendingRequests();
  }
  updateWithDetails(e, s) {
    this.state = e;
    const n = s.url;
    n && (this.url = urlFromURLString(n));
  }
  setUpContentScript(e) {
    return this.isBrowserFrame ? Promise.reject(new FrameIsBrowserFrameError(this)) : ((e = !!e), this.#F.enqueueRequest(this, { shouldEnableQRCodeScanning: e }));
  }
  async enableQRCodeScanning(e) {
    return this.hasSetUpContentScript ? this.#C("enableQRCodeScanner", { isEnabled: e }) : Promise.reject(new ContentScriptNotSetUpInFrame(this));
  }
  runHeuristics() {
    return this.isBrowserFrame ? Promise.reject(new FrameIsBrowserFrameError(this)) : this.hasSetUpContentScript ? this.#S.enqueueRequest(this) : Promise.reject(new Error("Cannot run metadata heuristics before setting up content script"));
  }
  readyToReceiveMessages() {
    return this.#F.reset(), this.setUpContentScript(!0);
  }
  #C(e, s) {
    let n = { subject: e };
    return s && (n = { ...n, ...s }), chrome.tabs.sendMessage(this.tab.id, n, { frameId: this.id });
  }
}
class Tab {
  static delayForSettingUpFrameContentScript = 50;
  static delayForCleaningUpFrames = 2e3;
  static enableDeferredFrameCleanup = !0;
  id;
  state;
  framesById = new Map();
  url;
  #A = null;
  constructor(e) {
    this.id = e;
  }
  get allFrames() {
    return chrome.webNavigation.getAllFrames({ tabId: this.id });
  }
  async injectContentScripts(e = !0) {
    if (!this.url) return;
    const s = this.url.protocol;
    if ("http:" !== s && "https:" !== s) return;
    const n = chrome.runtime.getManifest().content_scripts[0],
      i = this.id;
    await chrome.scripting.executeScript({ target: { tabId: i, allFrames: e }, files: n.js });
    for (const e of this.framesById.values())
      try {
        await e.setUpContentScript();
      } catch (e) {
        if (e instanceof FrameIsBrowserFrameError) return;
      }
  }
  prepareForRemoval() {
    for (const e of this.framesById.values()) e.prepareForRemoval();
  }
  activated(e) {
    this.#b(), chrome.contextMenus && chrome.contextMenus.removeAll();
  }
  update(e, s) {
    this.#b(), (this.state = s.status), e ? ((this.state = e.status), "loading" === e.status && (this.url = urlFromURLString(e.url))) : ((this.state = s.status), (this.url = urlFromURLString(s.url)));
  }
  addNewFrame(e, s, n = null) {
    this.#b();
    const i = s.frameId,
      r = new Frame(i, this);
    this.framesById.set(i, r), this.frameUpdated(e, i, n, s);
  }
  async frameUpdated(e, s, n, i) {
    this.#b();
    const r = this.ensureFrameExists(s);
    if ((r.updateWithDetails(n, i), r.hasCompletedLoad))
      try {
        r.hasSetUpContentScript ? await r.runHeuristics() : await r.setUpContentScript(e.shouldEnableQRCodeScanning);
      } catch (e) {
        if (!(e instanceof FrameDoesNotExistError)) {
          if (e instanceof FrameIsBrowserFrameError) return;
          throw e;
        }
        {
          const s = e.frameId;
          if (!this.framesById.get(s)) return;
          let n = await chrome.webNavigation.getFrame({ tabId: this.id, frameId: s });
          n || (n.prepareForRemoval(), this.framesById.delete(s));
        }
      }
  }
  async frameCompleted(e, s, n) {
    try {
      await this.frameUpdated(e, s, "complete", n);
    } catch (e) {}
  }
  frameIsReadyToReceiveMessages(e) {
    return this.ensureFrameExists(e).readyToReceiveMessages();
  }
  ensureFrameExists(e) {
    let s = this.framesById.get(e);
    return s || ((s = new Frame(e, this)), this.framesById.set(e, s)), s;
  }
  #b() {
    Tab.enableDeferredFrameCleanup &&
      (this.#A && (clearTimeout(this.#A), (this.#A = null)),
      (this.#A = setTimeout(
        (async () => {
          let e = new Map();
          const s = await this.allFrames,
            n = new Set((s || []).map((e) => e.frameId));
          if (!n.size && !this.framesById.size) return;
          for (const [s, i] of this.framesById) n.has(s) && e.set(s, i);
          this.framesById.size, e.size;
          (this.framesById = e), (this.#A = null);
        }).bind(this),
        Tab.delayForCleaningUpFrames
      )));
  }
}
class TabMonitor {
  tabsById = new Map();
  #E;
  #B;
  constructor() {
    this.#D(), this.#w();
  }
  get extensionIsPaired() {
    return this.#E;
  }
  set extensionIsPaired(e) {
    (this.#E = e), this.#y();
  }
  get nativeAppSupportsQRCodeScanning() {
    return this.#B;
  }
  set nativeAppSupportsQRCodeScanning(e) {
    (this.#B = e), this.#y();
  }
  get shouldEnableQRCodeScanning() {
    return this.#E && this.#B;
  }
  get #v() {
    return [...this.tabsById.values()].flatMap((e) => [...e.framesById.values()]);
  }
  #y() {
    const e = this.shouldEnableQRCodeScanning;
    return Promise.allSettled(this.#v.map((s) => s.enableQRCodeScanning(e).catch((e) => {})));
  }
  async #D() {
    const e = await chrome.tabs.query({});
    for (const s of e) {
      const e = s.id,
        n = new Tab(e);
      n.update(null, s), this.tabsById.set(e, n);
      const i = await chrome.webNavigation.getAllFrames({ tabId: e });
      for (const e of i) {
        if (void 0 === e.frameId) break;
        n.addNewFrame(this, e, s.status);
      }
    }
  }
  #w() {
    chrome.tabs.onCreated.addListener((e) => {
      const s = e.id;
      this.tabsById.set(s, new Tab(s));
    }),
      chrome.tabs.onUpdated.addListener((e, s, n) => {
        this.ensureTabExists(e).update(s, n);
      }),
      chrome.tabs.onActivated.addListener((e) => {
        this.ensureTabExists(e.tabId).activated(e);
      }),
      chrome.tabs.onRemoved.addListener((e, s) => {
        this.tabsById.delete(e);
      }),
      chrome.webNavigation.onBeforeNavigate.addListener((e) => {
        const s = e.tabId;
        this.ensureTabExists(s).addNewFrame(this, e);
      }),
      chrome.webNavigation.onCompleted.addListener(async (e) => {
        const s = e.tabId,
          n = e.frameId,
          i = this.ensureTabExists(s);
        try {
          await i.frameCompleted(this, n, e);
        } catch (e) {}
      }),
      chrome.webNavigation.onHistoryStateUpdated.addListener(async (e) => {
        const s = e.tabId,
          n = e.frameId,
          i = this.ensureTabExists(s);
        try {
          await i.frameUpdated(this, n, "updated", e);
        } catch (e) {}
      }),
      chrome.webNavigation.onTabReplaced.addListener((e) => {
        const s = e.replacedTabId;
        this.tabsById.get(s).prepareForRemoval(), this.tabsById.delete(s);
        const n = e.tabId;
        this.tabsById.set(n, new Tab(n));
      });
  }
  async performInitialSetup() {
    for (const e of this.tabsById.values()) await e.injectContentScripts();
  }
  ensureTabExists(e) {
    let s = this.tabsById.get(e);
    return s || ((s = new Tab(e)), this.tabsById.set(e, s)), s;
  }
  frameIsReadyToReceiveMessages(e, s) {
    return this.ensureTabExists(e).frameIsReadyToReceiveMessages(s);
  }
}
const CmdEndOp = 0,
  CmdUnused1 = 1,
  CmdChallengePIN = 2,
  CmdSetIconNTitle = 3,
  CmdGetLoginNames4URL = 4,
  CmdGetPassword4LoginName = 5,
  CmdSetPassword4LoginName_URL = 6,
  CmdNewAccount4URL = 7,
  CmdTabEvent = 8,
  CmdPasswordsDisabled = 9,
  CmdReloginNeeded = 10,
  CmdLaunchiCP = 11,
  CmdiCPStateChange = 12,
  CmdLaunchPasswordsApp = 13,
  CmdHello = 14,
  CmdOneTimeCodeAvailable = 15,
  CmdGetOneTimeCodes = 16,
  CmdDidFillOneTimeCode = 17,
  CmdSetUpTOTPGenerator = 18,
  CmdOpenURLInSafari = 1984,
  QueryStatus = { Success: 0, NoResults: 3 };
function cmd2string(e) {
  switch (e) {
    case CmdEndOp:
      return "CmdEndOp";
    case CmdUnused1:
      return "CmdUnused1";
    case CmdChallengePIN:
      return "CmdChallengePIN";
    case CmdSetIconNTitle:
      return "CmdSetIconNTitle";
    case CmdGetLoginNames4URL:
      return "CmdGetLoginNames4URL";
    case CmdGetPassword4LoginName:
      return "CmdGetPassword4LoginName";
    case CmdSetPassword4LoginName_URL:
      return "CmdSetPassword4LoginName_URL";
    case CmdNewAccount4URL:
      return "CmdNewAccount4URL";
    case CmdTabEvent:
      return "CmdTabEvent";
    case CmdPasswordsDisabled:
      return "CmdPasswordsDisabled";
    case CmdReloginNeeded:
      return "CmdReloginNeeded";
    case CmdLaunchiCP:
      return "CmdLaunchiCP";
    case CmdiCPStateChange:
      return "CmdiCPStateChange";
    case CmdLaunchPasswordsApp:
      return "CmdLaunchPasswordsApp";
    case CmdHello:
      return "CmdHello";
    case CmdOneTimeCodeAvailable:
      return "CmdOneTimeCodeAvailable";
    case CmdGetOneTimeCodes:
      return "CmdGetOneTimeCodes";
    case CmdDidFillOneTimeCode:
      return "CmdDidFillOneTimeCode";
    case CmdOpenURLInSafari:
      return "CmdOpenURLInSafari";
    default:
      return "Unknown Command";
  }
}
var actUnknown = -1,
  actDelete = 0,
  actUpdate = 1,
  actSearch = 2,
  actAddNew = 3,
  actMaybeAdd = 4,
  actGhostSearch = 5;
const DefaultCapabilities = { shouldUseBase64: !1, secretSessionVersion: SecretSessionVersion.SRPWithOldVerification, canFillOneTimeCodes: !1, operatingSystem: {}, supportsSubURLs: !1, scanForOTPURI: !1 },
  AmountOfTimeToBlockRefreshForNativeAppDisconnection = 5e3;
let g_tabMonitor = new TabMonitor();
var g_lastToolbarIconImageName,
  g_timeStartedFetchingCredentials,
  g_nativeAppPort = null,
  g_portToCompletionList = null,
  g_portToPopup = null,
  thePAKE = null,
  g_theState = ContextState.NotInSession,
  g_tabIdToURL = new Map(),
  g_Stage1Logins = new Map(),
  g_TabsToStateMap = new Map(),
  g_ErrorReturned = !1,
  g_secretSession = null,
  g_nativeAppCapabilities = null,
  g_localizer = new Localizer(),
  g_extensionSettings = new ExtensionSettings(),
  g_urlToDownloadNativeSupport = "https://support.apple.com/kb/DL1455",
  g_isDark = !1;
function getIsDark() {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch (e) {
    return g_isDark;
  }
}
function setIsDark(e) {
  g_isDark !== e && ((g_isDark = e), chrome.storage.local.set({ isDark: e }));
}
function imageDataForName(e) {
  if (e) return { 16: "images/" + (g_lastToolbarIconImageName = e) + (getIsDark() ? "-darkmode" : "") + "_icon16.png", 32: "images/" + g_lastToolbarIconImageName + (getIsDark() ? "-darkmode" : "") + "_icon32.png" };
}
function setUpEventListners() {
  chrome.runtime.onInstalled &&
    chrome.runtime.onInstalled.addListener(async (e) => {
      await g_tabMonitor.performInitialSetup(),
        chrome.declarativeContent &&
          chrome.declarativeContent.onPageChanged.removeRules(void 0, function () {
            chrome.declarativeContent.onPageChanged.addRules([{ conditions: [new chrome.declarativeContent.PageStateMatcher({ pageUrl: { schemes: ["https", "http"] } })], actions: [new chrome.declarativeContent.ShowPageAction()] }]);
          }),
        "install" === e.reason &&
          g_extensionSettings
            .attemptToControlBrowserAutoFillSettings()
            .then((e) => {})
            .catch((e) => {});
    }),
    chrome.runtime.onSuspend &&
      chrome.runtime.onSuspend.addListener(function () {
        g_tabIdToURL.clear(), g_Stage1Logins.clear(), g_TabsToStateMap.clear(), g_nativeAppPort.postMessage({ cmd: CmdEndOp });
      }),
    chrome.runtime.onSuspendCanceled && chrome.runtime.onSuspendCanceled.addListener(function () {}),
    chrome.runtime.onUpdateAvailable && chrome.runtime.onUpdateAvailable.addListener(function () {});
}
function secdSTATUS2string(e) {
  switch (e) {
    case 0:
      return "secdSTATUSsuccess";
    case 1:
      return "genericError";
    case 2:
      return "invalidParam";
    case 3:
      return "itemNotFound";
    case 4:
      return "failedToDelete";
    case 5:
      return "failedToUpdate";
    case 6:
      return "invalidMessageFormat";
    case 7:
      return "duplicateItem";
    case 8:
      return "unknownAction";
    case 9:
      return "invalidSession";
  }
}
function checkForValidOS() {
  if ("MacIntel" === navigator.platform) return (g_urlToDownloadNativeSupport = "https://www.apple.com/macos"), !0;
  const e = new RegExp("\\(Windows\\s*\\w*\\s*(\\d*)\\.(\\d*)", "i").exec(navigator.userAgent);
  return null !== e && 3 === e.length && (e[1] >= 10 ? ((g_urlToDownloadNativeSupport = "ms-windows-store://pdp/?productid=9PKTQ5699M62"), !0) : !(e[1] < 6) && !(e[2] < 1));
}
function setGlobalState(e, s) {
  (g_theState = e),
    (g_tabMonitor.extensionIsPaired = g_theState === ContextState.SessionKeySet),
    g_theState === ContextState.SessionKeySet ? setToolbarIcon("PasswordsToolbar") : setToolbarIcon("PasswordsToolbarUnpaired"),
    s || sendMessageToPopup({ subject: "nativeConnectionStateChanged", state: g_theState, appStoreURL: g_urlToDownloadNativeSupport });
}
function resetTheSession(e) {
  setGlobalState(e), (g_secretSession = new SecretSession(g_nativeAppCapabilities));
}
function STATUSErrorReturned(e) {
  switch ((secdSTATUS2string(e), g_theState)) {
    case ContextState.IncompatibleOS:
    case ContextState.NativeSupportNotInstalled:
    case ContextState.CheckEngine:
    case ContextState.MSG1Set:
    case ContextState.ChallengeSent:
      break;
    case ContextState.SessionKeySet:
      (g_ErrorReturned = !0), resetTheSession(ContextState.NotInSession);
    case ContextState.NotInSession:
      chrome.tabs.query({ active: !0, currentWindow: !0 }, function (e) {
        setToolbarIcon("PasswordsToolbarUnpaired");
      });
  }
}
function logMapElements(e, s, n) {}
function consultStage1Logins(e, s) {
  return isStringEmpty(e) ? (g_Stage1Logins.has(s) ? ((LoginName = g_Stage1Logins.get(s)), LoginName, g_Stage1Logins.delete(s), LoginName) : "") : e;
}
function entriesFromLoginNames4URLData(e) {
  let s = e.Entries;
  return (
    s ||
    ((s = []),
    Object.entries(e)
      .sort()
      .map(([e, n]) => {
        e.includes("Entry_") && s.push(n);
      }),
    s)
  );
}
function setToolbarIcon(e) {
  let s = chrome.action || chrome.browserAction;
  s && s.setIcon({ path: imageDataForName(e) });
}
function sendMessageToPopupAndCompletionList(e) {
  sendMessageToPopup(e), sendMessageToCompletionList(e);
}
function sendMessageToPopup(e) {
  bridgeFunctionCall({name: 'sendMessageToPopup', arguments: [e]});
  if (g_portToPopup)
    try {
      g_portToPopup.postMessage(e);
    } catch (e) {}
}
function sendMessageToCompletionList(e) {
  bridgeFunctionCall({name: 'sendMessageToCompletionList', arguments: [e]});
  if (g_portToCompletionList)
    try {
      g_portToCompletionList.postMessage(e);
    } catch (e) {}
}
function onSetUpTOTPContextMenuClicked(e, s) {
  if (g_theState !== ContextState.SessionKeySet) window.alert(g_localizer.getMessage("enableAutoFillPasswordsMessage"));
  else {
    const s = new URL(e.pageUrl);
    s.hostname, e.menuItemId, setUpTOTP(s.hostname, e.menuItemId);
  }
}
function connectToBackgroundNativeAppAndSetUpListeners() {
  setToolbarIcon("PasswordsToolbarUnpaired"),
    g_nativeAppCapabilities || (g_nativeAppCapabilities = DefaultCapabilities),
    (g_localizer = new Localizer(g_nativeAppCapabilities)),
    (g_secretSession = new SecretSession(g_nativeAppCapabilities)),
    chrome.runtime.onMessage.addListener((e, s, n) => {
      const i = s.tab.id,
        r = s.frameId,
        o = new URL(s.url);
      if ((o.hostname, s.tab.id, s.frameId, e.from, "content" === e.from))
        switch ((e.subject, e.subject)) {
          case "CmdCheckEstablishSession":
            CheckEstablishSession();
            break;
          case "SaveStage1LoginName":
            g_tabIdToURL.has(i) && ((strURL = g_tabIdToURL.get(i)), g_Stage1Logins.delete(strURL), g_tabIdToURL.delete(i)), o.hostname, e.theLogin, g_tabIdToURL.set(i, o.hostname), g_Stage1Logins.set(o.hostname, e.theLogin);
            break;
          case "CmdGetPassword4LoginName":
            const l = JSON.stringify({ ACT: actSearch, URL: o.hostname, USR: e.theLogin }),
              h = g_secretSession.createSMSG(l),
              u = { cmd: CmdGetPassword4LoginName, tabId: s.tab.id, frameId: s.frameId, url: e.theURL, payload: JSON.stringify({ QID: e.subject, SMSG: h }) };
            e.subject, e.subject, g_nativeAppPort.postMessage(u);
            break;
          case "CmdSetPassword4LoginName_URL":
          case "CmdNewAccount4URL":
            if (g_theState === ContextState.SessionKeySet) {
              e.theNLogin, o.hostname;
              let n = consultStage1Logins(e.theNLogin, o.hostname);
              if (!isStringEmpty(n)) {
                let i = JSON.stringify({ ACT: actMaybeAdd, URL: "", USR: "", PWD: "", NURL: e.theNURL, NUSR: n, NPWD: e.theNPassword }),
                  r = g_secretSession.createSMSG(i),
                  o = { cmd: CmdSetPassword4LoginName_URL, tabId: s.tab.id, frameId: s.frameId, payload: JSON.stringify({ QID: e.subject, SMSG: r }) };
                e.subject, g_nativeAppPort.postMessage(o);
              }
            }
            break;
          case "CmdSetIconNTitle":
            {
              let n = e.hostPageType;
              setIsDark(e.isDark);
              let i = !1;
              switch (n) {
                case WBSAutoFillFormTypeUndetermined:
                case WBSAutoFillFormTypeAutoFillableStandard:
                case WBSAutoFillFormTypeNonAutoFillable:
                  i = !1;
                  break;
                case WBSAutoFillFormTypeAutoFillableLogin:
                case WBSAutoFillFormTypeNewAccount:
                case WBSAutoFillFormTypeChangePassword:
                  i = !0;
              }
              switch (((g_TabsToStateMap.has(s.tab.id) && g_TabsToStateMap.get(s.tab.id)) || g_TabsToStateMap.set(s.tab.id, i), o.hostname, s.tab.id, s.frameId, humanReadableFormType(e.hostPageType), e.hostPageType, e.hostPageType)) {
                case WBSAutoFillFormTypeUndetermined:
                case WBSAutoFillFormTypeAutoFillableStandard:
                case WBSAutoFillFormTypeNonAutoFillable:
                  break;
                case WBSAutoFillFormTypeAutoFillableLogin:
                case WBSAutoFillFormTypeNewAccount:
                case WBSAutoFillFormTypeChangePassword:
                  let e = { cmd: CmdSetIconNTitle, tabId: s.tab.id, frameId: s.frameId, payload: JSON.stringify({ TID: "CmdSetIconNTitle", URL: o.hostname }) };
                  JSON.stringify(e), g_nativeAppPort.postMessage(e);
              }
            }
            break;
          case "ThemeChanged":
            setIsDark(e.isDark), setToolbarIcon(g_lastToolbarIconImageName);
            break;
          case "fillOneTimeCodeIntoForm":
            chrome.webNavigation.getFrame({ tabId: s.tab.id, frameId: s.frameId }, (n) => {
              (n.frameId = s.frameId), didFillOneTimeCode(e.oneTimeCode, { id: s.tab.id }, n);
            });
            break;
          case "typedUserNameChanged":
          case "keydown":
            sendMessageToCompletionList(e);
            break;
          case "CmdAddSetUpTOTPContextMenu":
            const m = !1;
            if (!chrome.contextMenus) break;
            chrome.contextMenus.create({ title: m ? `${g_localizer.getMessage("divTOTPMenu")} (${e.totpSetupURL})` : g_localizer.getMessage("divTOTPMenu"), id: e.totpSetupURL, contexts: ["all"] }),
              chrome.contextMenus.onClicked.addListener(onSetUpTOTPContextMenuClicked);
            break;
          case "CmdRemoveSetUpTOTPContextMenus":
            chrome.contextMenus && chrome.contextMenus.removeAll();
            break;
          case "getCapabilities":
            n(g_nativeAppCapabilities);
            break;
          case "readyToReceiveMessages":
            g_tabMonitor.frameIsReadyToReceiveMessages(i, r);
        }
    });
  try {
    (g_nativeAppPort = chrome.runtime.connectNative("com.apple.passwordmanager")).onMessage.addListener(async function (e) {
      switch ((JSON.stringify(e), chrome.storage.local.remove(["lastRetryTimestamp"]), cmd2string(e.cmd), e.cmd, e.cmd)) {
        case CmdPasswordsDisabled:
        case CmdReloginNeeded:
          resetTheSession(ContextState.CheckEngine),
            chrome.tabs.query({ active: !0, currentWindow: !0 }, function (e) {
              setToolbarIcon("PasswordsToolbarUnpaired");
            }),
            setGlobalState(ContextState.NotInSession, !0);
          break;
        case CmdChallengePIN:
          switch ((e.payload.QID, e.payload.QID)) {
            case "m0":
              (thePAKE = e.payload.PAKE), setGlobalState(ContextState.MSG1Set);
              break;
            case "m2":
              try {
                g_secretSession.processMessage(e.payload.PAKE);
                setGlobalState(ContextState.SessionKeySet), (thePAKE = null);
              } catch (e) {
                e.code, e.message, resetTheSession(ContextState.NotInSession);
              }
          }
          break;
        case CmdSetIconNTitle:
          var s = RememberIC.UnknownPage;
          switch ((e.payload, e.payload)) {
            case "DoNotRemember":
              s = RememberIC.DoNotRemember;
              break;
            case "RememberLoginAndPassword":
              s = RememberIC.RememberLoginAndPassword;
              break;
            case "UnknownPage":
              s = RememberIC.UnknownPage;
              break;
            case "NoValueSet":
              (s = RememberIC.NoValueSet), STATUSErrorReturned(e.STATUS);
          }
          try {
            await chrome.tabs.sendMessage(e.tabId, { from: "background", subject: "RememberICSelection", tabId: e.tabId, frameId: e.frameId, theRememberICSelection: s, capabilities: g_nativeAppCapabilities }, { frameId: e.frameId });
          } catch (s) {
            e.tabId, e.frameId, s.message;
          }
          break;
        case CmdGetLoginNames4URL:
          s = RememberIC.UnknownPage;
          var n = [],
            i = [],
            r = [],
            o = e.payload,
            l = e.tabId,
            h = e.frameId,
            u = g_secretSession.parseSMSG(o.SMSG);
          switch ((m = JSON.parse(u)).STATUS) {
            case QueryStatus.Success: {
              performance.now();
              entriesFromLoginNames4URLData(m).forEach((e) => {
                if ("Passwords not saved" === e.USR) s = RememberIC.DoNotRemember;
                else if ((n.push(e.USR), i.push(e.CDate || e.ModDate), r.push(e.sites[0]), "Not Included" === e.PWD)) s = RememberIC.RememberLoginAndPassword;
                else s = RememberIC.UnknownPage;
              });
              const e = !!m.RequiresUserAuthenticationToFill;
              sendMessageToPopupAndCompletionList({ from: "background", subject: "users", arrLoginNames: n, arrDates: i, arrHLDs: r, tabId: l, frameId: h, theRememberICSelection: s, requiresUserAuthenticationToFill: e });
              break;
            }
            case QueryStatus.NoResults:
              sendMessageToPopupAndCompletionList({ from: "background", subject: "users", arrDates: [], tabId: l, frameId: h, arrLoginNames: [], arrHLDs: [], theRememberICSelection: RememberIC.UnknownPage });
              break;
            default:
              STATUSErrorReturned(m.STATUS);
          }
          break;
        case CmdGetPassword4LoginName:
          var m;
          (o = e.payload), (u = g_secretSession.parseSMSG(o.SMSG));
          switch ((m = JSON.parse(u)).STATUS) {
            case QueryStatus.Success: {
              const s = e.url,
                n = entriesFromLoginNames4URLData(m).find((e) => e.sites.includes(s));
              n && sendUsernameAndPasswordToFrameForFilling(e.tabId, e.frameId, s, n.USR, n.PWD);
              break;
            }
            case QueryStatus.NoResults:
              break;
            default:
              STATUSErrorReturned(m.STATUS);
          }
          break;
        case CmdGetOneTimeCodes:
          handleGetOneTimeCodesCommand(e);
          break;
        case CmdTabEvent:
        case CmdNewAccount4URL:
        case CmdSetPassword4LoginName_URL:
          break;
        case CmdHello:
          (g_nativeAppCapabilities = e.capabilities ? e.capabilities : DefaultCapabilities),
            (g_localizer = new Localizer(g_nativeAppCapabilities)),
            (g_tabMonitor.nativeAppSupportsQRCodeScanning = g_nativeAppCapabilities.scanForOTPURI),
            sendMessageToPopupAndCompletionList({ subject: "hello", capabilities: g_nativeAppCapabilities }),
            resetTheSession(ContextState.NotInSession);
          break;
        case CmdOneTimeCodeAvailable:
          handleOneTimeCodeAvailableCommand(e);
          break;
        case CmdDidFillOneTimeCode:
          handleDidFillOneTimeCodeCommand(e);
          break;
        case CmdSetUpTOTPGenerator: {
          let e = g_secretSession.parseSMSG(o.SMSG),
            s = JSON.parse(e);
          if ((JSON.stringify(s), s.STATUS === QueryStatus.Success));
          else STATUSErrorReturned(s.STATUS);
          break;
        }
        default:
          cmd2string(e.cmd);
      }
    }),
      g_nativeAppPort.onDisconnect.addListener((e) => {
        const s = chrome.runtime.lastError;
        s.message,
          setTimeout(() => {
            if ((s.message, "Native host has exited." === s.message))
              chrome.storage.local.get(["lastRetryTimestamp"], (e) => {
                const s = e.lastRetryTimestamp;
                let n = !1;
                if (s) {
                  n = Date.now() - s > AmountOfTimeToBlockRefreshForNativeAppDisconnection;
                } else n = !0;
                n
                  ? (chrome.storage.local.set({ lastRetryTimestamp: Date.now() }), connectToBackgroundNativeAppAndSetUpListeners())
                  : (chrome.storage.local.remove(["lastRetryTimestamp"]), resetTheSession(ContextState.NativeSupportNotInstalled));
              });
            else s.message, resetTheSession(ContextState.NativeSupportNotInstalled);
          }, 1e3);
      }),
      g_nativeAppPort.postMessage({ cmd: CmdHello });
  } catch (e) {
    resetTheSession(ContextState.NativeSupportNotInstalled);
  }
}
async function sendUsernameAndPasswordToFrameForFilling(s, n, i, r, o) {
  try {
    await chrome.tabs.sendMessage(s, { from: "background", subject: "fillPassword", tabId: s, frameId: n, username: r, password: o, url: i }, { frameId: n });
  } catch (s) {
    e.message;
  }
}
function handleOneTimeCodeAvailableCommand(e) {
  getCurrentActiveTabAndFrame()
    .then((e) => getOneTimeCodes(e[0], e[1], null))
    .catch((e) => {});
}
function handleGetOneTimeCodesCommand(e) {
  let s = null;
  try {
    s = JSON.parse(g_secretSession.parseSMSG(e.payload.SMSG));
  } catch (e) {
    return;
  }
  const n = !!s.RequiresUserAuthenticationToFill;
  let i = s.STATUS;
  if (i !== QueryStatus.Success) return i !== QueryStatus.NoResults && STATUSErrorReturned(i), void sendMessageToPopupAndCompletionList({ from: "background", subject: "oneTimeCodes", oneTimeCodes: [], requiresUserAuthenticationToFill: n });
  let r = s.Entries;
  r && sendMessageToPopupAndCompletionList({ from: "background", subject: "oneTimeCodes", oneTimeCodes: r, requiresUserAuthenticationToFill: n });
}
async function handleDidFillOneTimeCodeCommand(e) {
  let s = null;
  try {
    s = JSON.parse(g_secretSession.parseSMSG(e.payload.SMSG));
  } catch (e) {
    return;
  }
  let n = s.STATUS;
  if (n !== QueryStatus.Success) return void (n !== QueryStatus.NoResults && STATUSErrorReturned(n));
  let i = s.Entries;
  if (i && i.length)
    try {
      await chrome.tabs.sendMessage(e.tabId, { subject: "fillCurrentTOTPCodeIntoForm", oneTimeCodes: i }, { frameId: e.frameId });
    } catch (e) {}
}
function CheckEstablishSession() {
  switch (g_theState) {
    case ContextState.NotInSession:
      ChallengePIN();
    case ContextState.ChallengeSent:
    case ContextState.MSG1Set:
  }
}
function startiCloudControlPanel() {
  var e = { cmd: CmdLaunchiCP };
  JSON.stringify(e), g_nativeAppPort.postMessage(e);
}
function startPasswordsApp() {
  let e = { cmd: CmdLaunchPasswordsApp };
  JSON.stringify(e), g_nativeAppPort.postMessage(e);
}
function setUpTOTP(e, s) {
  if (!g_nativeAppCapabilities.scanForOTPURI) return;
  const n = { cmd: CmdLaunchPasswordsApp, setUpTOTPPageURL: e, setUpTOTPURI: s };
  JSON.stringify(n), g_nativeAppPort.postMessage(n);
}
async function getUsernamesForMainFrameOfActiveTab() {
  if (g_theState !== ContextState.SessionKeySet) return;
  const e = await chrome.tabs.query({ active: !0, currentWindow: !0 });
  if (!e.length) return;
  const s = e[0].id;
  GetLoginNames4URL(urlFromURLString((await chrome.webNavigation.getFrame({ tabId: s, frameId: 0 })).url).hostname, s, 0);
}
function GetLoginNames4URL(e, s, n) {
  let i = JSON.stringify({ ACT: actGhostSearch, URL: e }),
    r = g_secretSession.createSMSG(i),
    o = { cmd: CmdGetLoginNames4URL, url: e, tabId: s, frameId: n, payload: JSON.stringify({ QID: "CmdGetLoginNames4URL", SMSG: r }) };
  (g_timeStartedFetchingCredentials = performance.now()), g_nativeAppPort.postMessage(o);
}
function GetPassword4Name(e, u, s, n) {
  let i = JSON.stringify({ USR: u, URL: e, ACT: 2 }),
    r = g_secretSession.createSMSG(i),
    o = { cmd: CmdGetPassword4LoginName, url: e, tabId: s, frameId: n, payload: JSON.stringify({ QID: "CmdGetPassword4LoginName", SMSG: r }) };
  (g_timeStartedFetchingCredentials = performance.now()), g_nativeAppPort.postMessage(o);
}
function getOneTimeCodes(e, s, n) {
  getAllParentFrameURLsOfFrame(e, s)
    .then((i) => {
      let r = { ACT: actGhostSearch, TYPE: "oneTimeCodes", frameURLs: i };
      n && (r.username = n);
      let o = g_secretSession.createSMSG(r),
        l = { cmd: CmdGetOneTimeCodes, tabId: e.id, frameId: s.frameId, payload: JSON.stringify({ QID: "CmdGetOneTimeCodes", SMSG: o }) };
      g_nativeAppPort.postMessage(l);
    })
    .catch((e) => {});
}
function didFillOneTimeCode(e, s, n) {
  if ("totp" === e.source)
    getAllParentFrameURLsOfFrame(s, n)
      .then((i) => {
        let r = { ACT: actSearch, TYPE: "oneTimeCodes", frameURLs: i },
          o = e.username;
        o && (r.username = o);
        let l = g_secretSession.createSMSG(r),
          h = { cmd: CmdDidFillOneTimeCode, tabId: s.id, frameId: n.frameId, payload: JSON.stringify({ QID: "CmdDidFillOneTimeCode", SMSG: l }) };
        g_nativeAppPort.postMessage(h);
      })
      .catch((e) => {});
}
function openURLInSafari(e) {
  g_nativeAppPort.postMessage({ cmd: CmdOpenURLInSafari, url: e });
}
function getAllParentFrameURLsOfFrame(e, s) {
  let n = e.id;
  return new Promise((i) => {
    -1 !== s.parentFrameId
      ? chrome.webNavigation.getFrame({ tabId: n, frameId: s.parentFrameId }, (n) => {
          getAllParentFrameURLsOfFrame(e, n)
            .then((e) => {
              i([s.url].concat(e));
            })
            .catch((e) => {});
        })
      : i([s.url]);
  });
}
function ChallengePIN() {
  if (g_theState === ContextState.NotInSession) {
    var e = { QID: "m0", PAKE: g_secretSession.initialMessage(), HSTBRSR: g_localizer.getMessage("browserName") },
      s = { cmd: CmdChallengePIN, msg: JSON.stringify(e) };
    setGlobalState(ContextState.ChallengeSent);
    try {
      g_nativeAppPort.postMessage(s);
    } catch (e) {
      e.message, resetTheSession(ContextState.NativeSupportNotInstalled);
    }
  }
}
function PINSet(e) {
  g_secretSession.setPin(e);
  try {
    let e = { QID: "m2", PAKE: g_secretSession.processMessage(thePAKE) },
      s = { cmd: CmdChallengePIN, msg: JSON.stringify(e) };
    g_nativeAppPort.postMessage(s);
  } catch (e) {
    e.code, e.message, resetTheSession(ContextState.NotInSession);
  }
}
function getCurrentActiveTabAndFrame() {
  return new Promise((e) => {
    chrome.tabs.query({ active: !0, currentWindow: !0 }, function (s) {
      chrome.webNavigation.getAllFrames({ tabId: s[0].id }, function (n) {
        e([s[0], n[0]]);
      });
    });
  });
}
function getCurrentActiveTabAndItsFrames() {
  return new Promise((e) => {
    chrome.tabs.query({ active: !0, currentWindow: !0 }, function (s) {
      chrome.webNavigation.getAllFrames({ tabId: s[0].id }, function (n) {
        e([s[0], n]);
      });
    });
  });
}
function canFillOneTimeCodes() {
  return (g_nativeAppCapabilities || DefaultCapabilities).canFillOneTimeCodes;
}
function setUpPortToCompetionList(e) {
  (g_portToCompletionList = e),
    e.onMessage.addListener(async function (s) {
      switch ((JSON.stringify(s), s.subject)) {
        case "getContextAndMetadataFromContent":
          getCurrentActiveTabAndItsFrames()
            .then(function (s) {
              const n = s[0].id,
                i = s[0].incognito;
              for (const r of s[1]) {
                const s = r.frameId;
                chrome.tabs.sendMessage(n, { from: "background", subject: "getContextAndMetadataForActiveTextField" }, { frameId: s }, function (r) {
                  r &&
                    e.postMessage({
                      subject: "replyForGetContextAndMetadataFromContent",
                      state: g_theState,
                      tabId: n,
                      frameId: s,
                      url: r.url,
                      textFieldMetadata: r.textFieldMetadata,
                      formMetadata: r.formMetadata,
                      presetUserName: r.presetUserName,
                      hostname: r.hostname,
                      canFillOneTimeCodes: canFillOneTimeCodes(),
                      isIncognito: i,
                    });
                });
              }
            })
            .catch((e) => {});
          break;
        case "GetLoginNames4URL":
          GetLoginNames4URL(s.hostname, s.tabId, s.frameId);
          break;
        case "getOneTimeCodes":
          const n = s.tabId,
            i = s.frameId;
          chrome.webNavigation.getFrame({ tabId: n, frameId: i }, (e) => {
            (e.frameId = i), getOneTimeCodes({ id: s.tabId }, e, s.username);
          });
          break;
        case "openPasswordManagerAndDismissCompletionList":
          startPasswordsApp();
          try {
            await chrome.tabs.sendMessage(s.tabId, { subject: "dismissCompletionList" }, { frameId: s.frameId });
          } catch (e) {}
          break;
        case "openURLInSafari":
          openURLInSafari(s.url);
          break;
        case "resizeCompletionList":
        case "fillLoginIntoForm":
        case "fillOneTimeCodeIntoForm":
        case "dismissCompletionList":
          try {
            await chrome.tabs.sendMessage(s.tabId, s, { frameId: s.frameId });
          } catch (e) {}
      }
    }),
    e.onDisconnect.addListener((e) => {
      e === g_portToCompletionList && (g_portToCompletionList = null);
    }),
    sendMessageToCompletionList({ subject: "hello", capabilities: g_nativeAppCapabilities });
}
function setUpPortToPopup(e) {
  (g_portToPopup = e), console.log(e),
    e.onMessage.addListener(function (s) {
      switch ((JSON.stringify(s), s.subject)) {
        case "getInitialPopupState":
          e.postMessage({ subject: "nativeConnectionStateChanged", state: g_theState, appStoreURL: g_urlToDownloadNativeSupport });
          break;
        case "tryToEstablishNativeConnectionInResponseToUserActivatingPopup":
          chrome.storage.local.set({ lastRetryTimestamp: Date.now() }), connectToBackgroundNativeAppAndSetUpListeners();
          break;
        case "challengePIN":
          ChallengePIN();
          break;
        case "userEnteredPIN":
          PINSet(s.pin);
          break;
        case "GetLoginNames4URL":
          GetLoginNames4URL(s.hostname, s.tabId, s.frameId);
          break;
        case "openPasswordManager":
          startPasswordsApp();
          break;
        case "startiCloudControlPanel":
          startiCloudControlPanel();
          break;
        case "SetUpTOTP":
          setUpTOTP(s.theURL, s.theTOTPURI);
          break;
        case "openURLInSafari":
          openURLInSafari(s.url);
      }
    }),
    e.onDisconnect.addListener(function () {
      g_theState === ContextState.MSG1Set && PINSet(""), (g_portToPopup = null);
    }),
    sendMessageToPopup({ subject: "hello", capabilities: g_nativeAppCapabilities });
}
chrome.storage.local.get("isDark", function (e) {
  void 0 !== e.isDark && (g_isDark = e.isDark), g_lastToolbarIconImageName && setToolbarIcon(g_lastToolbarIconImageName);
}),
  setUpEventListners(),
  checkForValidOS()
    ? connectToBackgroundNativeAppAndSetUpListeners()
    : (chrome.storage.local.get("hideUnsupportedOSPrompt", function (e) {
        e.hideUnsupportedOSPrompt || (chrome.storage.local.set({ hideUnsupportedOSPrompt: 1 }), window.alert(g_localizer.getMessage("unsupportedOS")));
      }),
      setGlobalState(ContextState.IncompatibleOS)),
  chrome.windows.onFocusChanged.addListener(async (e) => {
    if (!g_nativeAppPort || e === chrome.windows.WINDOW_ID_NONE) return;
    let s = await chrome.tabs.query({ active: !0, currentWindow: !0 });
    if (s.length < 1) return;
    const n = s[0].id;
    if (!n) return;
    const i = { cmd: CmdTabEvent, tabId: n, event: 1 };
    JSON.stringify(i), g_nativeAppPort.postMessage(i);
  }),
  chrome.tabs.onActivated.addListener((e) => {
    if ((JSON.stringify(e), !g_nativeAppPort)) return;
    let s = { cmd: CmdTabEvent, tabId: e.tabId, event: 1 };
    JSON.stringify(s), g_nativeAppPort.postMessage(s);
  }),
  chrome.tabs.onRemoved.addListener((e, s) => {
    if ((JSON.stringify(s), !g_nativeAppPort)) return;
    let n = { cmd: CmdTabEvent, tabId: e, event: 0 };
    JSON.stringify(n), g_nativeAppPort.postMessage(n), g_TabsToStateMap.delete(e);
  });
try {
  "undefined" != typeof window &&
    window.matchMedia("(prefers-color-scheme: dark)")?.addEventListener("change", function () {
      setIsDark(getIsDark()), setToolbarIcon(g_lastToolbarIconImageName);
    });
} catch (e) {}
chrome.runtime.onConnect.addListener(function (e) {
  console.log('chrome.runtime.onConnect.addListener', e);
  e.name, "completionList" === e.name ? setUpPortToCompetionList(e) : "popup" === e.name ? setUpPortToPopup(e) : e.name;
});
