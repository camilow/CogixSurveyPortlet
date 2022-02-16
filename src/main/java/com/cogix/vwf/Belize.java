package com.cogix.vwf;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.util.Base64;

@SuppressWarnings({"WeakerAccess", "UnnecessaryLocalVariable", "unused", "SameParameterValue"})
public class Belize {


    private SecretKeySpec secretKey;
    private Cipher cipher;

    static private Belize me;
    private String key;

    static public Belize Get ( String phrase)  {
        if ( me == null ) {
            me = new Belize ();
            me.init (phrase);
        }
        return me;
    }

    public void init (String phrase)  {
        try {
            me = this;
            if ( phrase == null || "".equals(phrase))
                phrase = "A8eF6e(b$s2ko9+;q@4b!`a~uxily32t9asdj3";
            if ( phrase.length() < 16 )
                phrase += "A8eF6e(b$s2ko9+;q@";
            key = hashCode (phrase);
            int length = 16;
            byte [] ekey = new byte [length];
            ekey = fixSecret (phrase,length);
            String algorithm = "AES";
            this.secretKey = new SecretKeySpec(ekey, algorithm);
            this.cipher = Cipher.getInstance(algorithm);
        } catch ( Exception e ) {
            e.printStackTrace ();
        }

    }

    public String encrypt (String f)
    {
        try {
            this.cipher.init(Cipher.ENCRYPT_MODE, this.secretKey);
            byte [] unenc = f.getBytes ( "UTF-8" );
            byte [] encr = this.cipher.doFinal(unenc);
            String enc = Base64.getEncoder ().encodeToString ( encr );
            return enc;
        } catch ( Exception e ) {
            e.printStackTrace ();
            return e.toString ();
        }
    }

    public String decrypt (String f) {
        try {
            this.cipher.init(Cipher.DECRYPT_MODE, this.secretKey);
            byte [] encr = Base64.getDecoder ().decode (f);
            byte[] unenc = this.cipher.doFinal(encr);
            String une = new String (unenc,"UTF-8");
            return une;
        } catch ( Exception e ) {
            e.printStackTrace ();
            return e.toString ();
        }
    }


    private byte[] fixSecret(String s, int length) throws UnsupportedEncodingException {
        if (s.length() < length) {
            int missingLength = length - s.length();
            for (int i = 0; i < missingLength; i++) {
                s += " ";
            }
        }
        return s.substring(0, length).getBytes("UTF-8");
    }


    private String hashCode (String s) {
        long h = 0;
        for ( int k = 0 ; k < s.length (); k++ ) {
            int c = s.charAt ( k );
            h = 31 * h + c;
        }
        return String.valueOf(Math.abs(h));
    }

    static public String key () {
        Belize b = Belize.Get (null);
        return b.key;
    }

    static public String fluff (String s) {
        if ( s == null || s.equals ("") )
            return s;
        StringBuffer t = new StringBuffer (s) ;
        int len = s.length();
        int inc = 0x73;

        final String f = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        final String g = "9876543210zyxwvutsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA";
        for ( int k = 0 ; k < len ; k++ ) {
            char ch = t.charAt(k);
            int n = f.indexOf (ch);
            t.setCharAt ( k , n >= 0 ? g.charAt (n) : ch ) ;
            inc += k ;
        }
        return new String (t);
    }}

/*
How to use this:
In gets, add &lry-bz= key()
In posts, add lry-bz= key()
When sending and receiving userid's use fluff(userid)

So now, instead of using fluff, I use:
when encrypting, String userid = encrypt (userid)
when decrypting, String userid = decrpyt (userid)
The enctypted value is an odd looking string, that looks very encrypted to anyone, and is hack proof pretty much
Will VF servlet exec work with java 8?



 */

