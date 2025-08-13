import CryptoJS from "crypto-js";

(function () {
  const getUTCDateParts = () => {
    const now = new Date();
    return {
      dd: now.getUTCDate(),
      MM: now.getUTCMonth() + 1,
      yy: parseInt(String(now.getUTCFullYear()).slice(-2)),
    };
  };

  const getUTCDateStrings = () => {
    const now = new Date();
    const yyyy = String(now.getUTCFullYear());
    const MMstr = String(now.getUTCMonth() + 1).padStart(2, "0");
    const ddStr = String(now.getUTCDate()).padStart(2, "0");
    return { yyyy, MMstr, ddStr };
  };

  const getEncryptionKey = () => {
    const { dd, MM, yy } = getUTCDateParts();
    const template = [
      167,
      6,
      "dd",
      129,
      65,
      206,
      155,
      "yy",
      220,
      152,
      84,
      113,
      20,
      238,
      "MM",
      174,
    ];

    return template.map((item) => {
      if (item === "dd") return dd;
      if (item === "MM") return MM;
      if (item === "yy") return yy;
      return item;
    });
  };

  const getEncryptionIV = () => {
    const { yyyy, MMstr, ddStr } = getUTCDateStrings();
    const template = [
      82,
      80,
      65,
      65,
      83,
      95,
      "y",
      "y",
      "y",
      "y",
      45,
      "M",
      "M",
      45,
      "d",
      "d",
    ];

    let yearIndex = 0;
    const monthBytes = MMstr.split("").map((c) => c.charCodeAt(0));
    const dayBytes = ddStr.split("").map((c) => c.charCodeAt(0));

    return template.map((char) => {
      if (char === "y") return yyyy.charCodeAt(yearIndex++);
      if (char === "M") return monthBytes.shift();
      if (char === "d") return dayBytes.shift();
      return char;
    });
  };

  const encrypt = (email) => {
    const key = getEncryptionKey();
    const iv = getEncryptionIV();
    const keyHex = key.map((b) => b.toString(16).padStart(2, "0")).join("");
    const ivHex = iv.map((b) => b.toString(16).padStart(2, "0")).join("");

    return CryptoJS.AES.encrypt(email, CryptoJS.enc.Hex.parse(keyHex), {
      iv: CryptoJS.enc.Hex.parse(ivHex),
    }).toString();
  };

  const decrypt = (cipherText) => {
    const key = getEncryptionKey();
    const iv = getEncryptionIV();
    const keyHex = key.map((b) => b.toString(16).padStart(2, "0")).join("");
    const ivHex = iv.map((b) => b.toString(16).padStart(2, "0")).join("");

    const decrypted = CryptoJS.AES.decrypt(
      cipherText,
      CryptoJS.enc.Hex.parse(keyHex),
      { iv: CryptoJS.enc.Hex.parse(ivHex) }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  };

  const getUserToken = (email) => {
    return encrypt(email);
  };

  const injectAuthTokens = (body, user_token, access_token) => {
    return body
      .replace(/{USER_TOKEN}/g, user_token)
      .replace(/{BEARER_TOKEN}/g, access_token);
  };

  window.Authorization = {
    getEncryptionKey,
    getEncryptionIV,
    encrypt,
    decrypt,
    getUserToken,
    injectAuthTokens,
  };
})();
