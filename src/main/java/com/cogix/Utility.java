package com.cogix;

import com.cogix.vwf.Belize;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.util.PropsUtil;

import javax.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Vector;


@SuppressWarnings("Duplicates")
public class Utility {

    static String getUserName ( User user ) {
        if ( user == null )
            return "";
        String un = user.getScreenName ();
        return un == null ? "" : un;
    }
    static String ViewsFlashURL ( HttpServletRequest req ) {
        return ViewsFlashURL ( req,false );
    }
    static String ViewsFlashURL ( HttpServletRequest req, boolean bFromRequest ) {
        String prot = req.isSecure () ? "https://" : "http://";
        prot = prot + req.getServerName () + ":" + req.getServerPort () + "/ViewsFlash";
        if ( bFromRequest ) {
            return prot;
        }
        String p = PropsUtil.get ( "com.cogix.surveyportlet.ViewsFlashURL" );
        if ( p ==  null )
            p = System.getenv ( "com_cogix_surveyportlet_ViewsFlashURL" );
        // p = "http://mini.cogix.com:8080/ViewsFlash";
        if ( p != null )
            return p;
        return prot;
    }

    static HttpURLConnection getConnection (String urlString ) throws IOException {
        URL url = new URL ( urlString );
        HttpURLConnection con = (HttpURLConnection) url.openConnection ();
        con.setRequestMethod ( "GET" );
        String USER_AGENT = "Mozilla/5.0";
        con.setRequestProperty ( "User-Agent", USER_AGENT );
        con.getResponseCode ();
        return con;
    }

    static String GetRequest(String appurl, String querystring) throws Exception {
        // appurl is http..../ViewsFlash/lry2.jsp
        /*
        String encryptedquery = Balaffle.GetBalaffle ( null ).encrypt ( querystring );
        // urlstring is the query string
        String encodedUrl = URLEncoder.encode(encryptedquery, "UTF-8");
        String urlString = appurl + "?" + encodedUrl;
        */
        String urlString = appurl + "?" + querystring;
        String key = Belize.key();
        urlString += "&lry-bz=" + key;


        URL url = new URL ( urlString );
        HttpURLConnection con = (HttpURLConnection) url.openConnection ();

        con.setRequestMethod ( "GET" );

        String USER_AGENT = "Mozilla/5.0";
        con.setRequestProperty ( "User-Agent", USER_AGENT );

        // System.out.println ( "\nSending get request : " + url );
        int responseCode = con.getResponseCode ();
        // System.out.println ( "\nResponse code : " + responseCode );

        // Reading response from input Stream
        BufferedReader in = new BufferedReader (
                new InputStreamReader ( con.getInputStream () ) );
        StringBuilder response = new StringBuilder ();

        int data = in.read();
        while ( data != -1 ) {
            response.append ( (char) data);
            data = in.read();
        }

        in.close ();

        String result = response.toString ();
        /*
        String copy;
        if ( result.length () > 40 )
            copy = result.substring ( 0, 40 );
        else
            copy = new String ( result );

        System.out.println("\nResut: "+ copy);
        */
        return result;
    }

    //  url .../appname ( without ? )
    //  params &x=y&a=b, params are URLEncoded; no ?


    public static String PostRequest(String app, String params) throws Exception {
        // http://www.java2blog.com/2016/07/how-to-send-http-request-getpost-in-java.html
        //        String urlString = "http://localhost:8080/ViewsFlash/servlet/viewsflash?cmd=getspotnames

        String key = Belize.key();
        params += "&lry-bz=" + key;

        URL url = new URL(app);
        HttpURLConnection con = (HttpURLConnection) url.openConnection();

        con.setRequestMethod("POST");
        con.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");

        String USER_AGENT = "Mozilla/5.0";
        con.setRequestProperty("User-Agent", USER_AGENT);
        con.setDoOutput(true);
        OutputStream os = con.getOutputStream();
        os.write(params.getBytes("UTF-8"));
        os.flush();
        os.close();

        // System.out.println("\nSending post request : "+ url + " ? " + params);
        int responseCode = con.getResponseCode();
        // System.out.println("\nResponse code : "+ responseCode);

        // Reading response from input Stream
        BufferedReader in = new BufferedReader(
                new InputStreamReader (con.getInputStream()));
        String output;
        StringBuilder response = new StringBuilder ();

        while ((output = in.readLine()) != null) {
            response.append(output).append("\n");
        }
        in.close();
        String result = response.toString ();
        // System.out.println("\nResut: "+ result);
        return result;


    }

    static public String constructSelectOptions (  Vector<SelectOption> options, String currentvalue ) {
        String option ="<option value=\"%v\" %s>%c</option>\n";
        StringBuilder sb = new StringBuilder (  );
        for ( SelectOption o : options ) {
            String opt = option.replace("%v",o.value);
            opt = opt.replace ( "%c",o.caption );
            String selectd = o.value .equals(currentvalue) ? " selected " : "";
            opt = opt.replace ( "%s",selectd );
            sb.append ( opt );
        }

        return sb.toString ();
    }

    public static class SelectOption {
        public String value;
        public String caption;

        SelectOption (String v) {
            value  = v;
            caption = v;
        }
        SelectOption (String v, String c) {
            value  = v;
            caption = c == null ? v : c ;
        }
    }
/*
    // May need a different one for the edit mode
    static public String ViewsFlashApiQuery ( String querystring, HttpServletRequest req, HttpServletResponse resp ) throws ServletException, IOException {
        String pathandquery =  "/servlet/viewsflash?"+querystring ;
        pathandquery += "&outputtorequestattribute=myatt";
        RequestDispatcher rd =req.getServletContext ().getContext("//ViewsFlash").getRequestDispatcher(pathandquery);
        rd.include (req,resp);
        return (String) req.getAttribute ( "myatt" );
    }

    static public String ViewsFlashApiQuery ( String querystring,  RenderRequest renderRequest, RenderResponse renderResponse  ) {
        // I think that a referene to "/ViewsFlash/servlet/viewsflash" might do the trick here;
        // what about cross-context? And what about not tomcat?
        return null;
    }
*/

}
