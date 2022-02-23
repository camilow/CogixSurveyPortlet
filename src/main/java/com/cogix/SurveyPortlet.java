package com.cogix;


import aQute.bnd.annotation.metatype.Configurable;
import com.cogix.vwf.Belize;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.portlet.LiferayPortlet;
import com.liferay.portal.kernel.util.PropsUtil;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Modified;

import javax.portlet.ActionRequest;
import javax.portlet.ActionResponse;
import javax.portlet.Portlet;
import javax.portlet.PortletException;
import javax.portlet.PortletMode;
import javax.portlet.PortletModeException;
import javax.portlet.PortletPreferences;
import javax.portlet.PortletRequestDispatcher;
import javax.portlet.PortletSession;
import javax.portlet.PortletURL;
import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;
import javax.portlet.WindowState;
import javax.portlet.WindowStateException;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.Locale;
import java.util.Map;
import java.util.MissingResourceException;
import java.util.Vector;

import static com.liferay.portal.kernel.util.PortalUtil.getUser;

@Component(
        configurationPid = "com.cogix.Configuration",

        immediate = true,
        property = {
                "javax.portlet.name=Survey_WAR_ViewsFlash",
                "com.liferay.portlet.display-category=Survey",
                "com.liferay.portlet.instanceable=true",
                "javax.portlet.display-name=Survey",

                "com.liferay.portlet.requires-namespaced-parameters=false",
                // "com.liferay.portlet.user-principal-strategy=screenName", not needed since I dont use getRemoteUser any more
                "javax.portlet.resource-bundle=content.Language",
                "com.liferay.portlet.header-portlet-javascript=/js/XUStandard2_.js",
                "com.liferay.portlet.header-portlet-javascript=/js/UCalculate3_.js",
                "com.liferay.portlet.header-portlet-javascript=/js/XUDisplayOrHide2_.js",
                "com.liferay.portlet.header-portlet-javascript=/js/CalendarPopup.js",
                "com.liferay.portlet.header-portlet-javascript=/js/DynamicDropDownUnobf.js",
                // "com.liferay.portlet.header-portlet-javascript=/js/UReadOnly.js",
                // "com.liferay.portlet.header-portlet-javascript=/js/URequired2_.js",

         //       "com.liferay.portlet.header-portlet-javascript=/js/junk.js",

                "com.liferay.portlet.header-portlet-css=/css/Standard_.css",
                "com.liferay.portlet.header-portlet-css=/css/Standard_lry7.css",
                "com.liferay.portlet.header-portlet-css=/css/cogix.css",

         //       "com.liferay.portlet.header-portlet-css=/css/nop.css",

                "javax.portlet.security-role-ref=power-user,user"
//              Reference: https://dev.liferay.com/develop/reference/-/knowledge_base/7-0/portlet-descriptor-to-osgi-service-property-map#two

        },
        service = Portlet.class
)

@SuppressWarnings("Duplicates")
public class SurveyPortlet extends LiferayPortlet {

    static final String lrydotjsp = "/lry.jsp";    //  change to lry2.jsp for encrypted version
    protected static Belize belize;

    @Override
    public void init() throws PortletException {
        super.init ();
        String phrase = null;
        if ( PropsUtil.getProps () != null ) {
            phrase = PropsUtil.get ( "com.cogix.surveyportlet.adage" );
        }
        if ( phrase == null )
            phrase = System.getenv ("com_cogix_surveyportlet_adage");
        belize = Belize.Get (phrase);
        System.out.println ("Cogix Survey Portlet");
        /*
        String phrase = PropsUtil.get("com.cogix.surveyportlet.adage");
         // This is the best of times under all circumstances
        try {
            Balaffle.GetBalaffle ( phrase );
        } catch ( UnsupportedEncodingException e ) {
            System.out.println ( e.toString () );
            throw new PortletException ( e.toString () );
        }
        */
    }

    private volatile Configuration _configuration;
    private static String xframe = null;
    public static String SURVEYPORTLETTAKING = "com.cogix.surveyportlet.taking";

    public static boolean CannotiframeUI ( HttpServletRequest req)  {
        if ( xframe == null ) {
            try {
                String apicmd = Utility.ViewsFlashURL ( req ); // /ViewsFlash
                apicmd += lrydotjsp +"?lry-op=xframe";
                HttpURLConnection con = Utility.getConnection (apicmd);
                boolean h = con.getHeaderField ( "X-Frame-Options" ) != null;
                xframe = String.valueOf(h);
            } catch ( IOException e ) {
                return true;
            }
        }
        return "true".equals (xframe);
    }

    @Activate
    @Modified
    protected void activate ( Map<Object, Object> properties ) {
        _configuration = Configurable.createConfigurable (
                Configuration.class, properties );
    }

    @Override
    protected void doView (
            RenderRequest renderRequest, RenderResponse renderResponse )
            throws IOException, PortletException {
        renderRequest.setAttribute ("com.cogix.SurveyPortlet",this);
        HttpServletRequest origrequest = (HttpServletRequest)renderRequest.getAttribute("com.liferay.portal.kernel.servlet.PortletServletRequest");

        String userid;
        User userobj = null;
        try {
            userobj = getUser(renderRequest); // getScreenName gives name
            userid = Utility.getUserName ( userobj );
        } catch ( Exception e ) {
            userid=e.toString ();
        }

        String fuserid = SurveyConfigurationAction.getEncryptedId (userid,userobj);
        /*
        String fuserid = belize.encrypt(userid);
        fuserid = URLEncoder.encode (fuserid,"UTF-8");
        */
        PortletSession psess = renderRequest.getPortletSession ( true );

        PortletPreferences prefs = renderRequest.getPreferences ();

        renderRequest.setAttribute( "SurveyPortlet" ,this);

        // Code from original SurveyContent.jsp

        WindowState wstate = renderRequest.getWindowState();
        boolean bMaximized = WindowState.MAXIMIZED.equals(wstate);
        boolean bMinimized = WindowState.MINIMIZED.equals(wstate);

        String spotname = prefs.getValue( "spotname","");
        String pollname = prefs.getValue( "pollname","");
        boolean bRotateAutomatically = "*".equals (pollname);
        String pollembedorlink =    prefs.getValue("pollembedorlink", " ");
        String pollresultslink =    prefs.getValue("pollresultslink", "unchecked");
        String pollresultsaftercompleting =           prefs.getValue("pollresultsaftercompleting", "unchecked");
        String uselocale =			prefs.getValue("uselocale", "unchecked");
        String continuelink = "";

        boolean bUseLocale = ! bRotateAutomatically && "checked".equals (uselocale);
        Locale locale = bUseLocale ? renderRequest.getLocale () : null ;
        if ( locale == null )
            locale = Locale.getDefault();

        String pollid = null;
        String takesurvey = null;
        String showeligible = null;
        int neligible =0 ;
        String [] eligible = {};
        String lryjsp = Utility.ViewsFlashURL ( origrequest ) + lrydotjsp;

        if ( "**".equals(spotname) ) {
            takesurvey = (String) psess.getAttribute ( SURVEYPORTLETTAKING );
            if ( takesurvey != null && ! "~".equals ( takesurvey )) {
                pollid = takesurvey;
                pollembedorlink = "embed";
                int ibang = pollid.indexOf('!');
                if ( ibang > 0 ) {
                    spotname = pollid.substring(0,ibang);
                    pollname = pollid.substring(ibang+1);
                }
                else {
                    spotname = pollid;
                    pollname = pollid;
                }
            }
            else {
                // Show all eligible; locale still applies
                showeligible = "";
                // Use API to get elegible pollids cmd=getmysurveys&userid=xxx
                String getmysurveys = "lry-op=vfapi&cmd=getmysurveys&lry-userid=" + fuserid
                        + "&lry-t=" + System.currentTimeMillis ();
                String available;
                try {
                    available = Utility.GetRequest ( lryjsp, getmysurveys );
                    if ( available == null || "".equals(available) || available.startsWith("<viewsflash") ) {
                    } else {
                        Vector<String> urls = new Vector<>();
                        //  Format: spotname!pollname?survey title\t...
                        String [] avs = available.split("\t");
                        String linkt = "<a href=\"xx\">yy</a>";
                        for ( String av: avs ) {
                            int ixq = av.indexOf('?');
                            if ( ixq > 0 ) {
                                String takepoll = av.substring(0,ixq);
                                String title = ixq < av.length() -1 ? av.substring (ixq+1) : takepoll ;
                                PortletURL aurl = renderResponse.createActionURL ();
                                try {
                                    aurl.setWindowState ( bMaximized ? WindowState.MAXIMIZED : WindowState.NORMAL );
                                } catch (WindowStateException e) {}
                                aurl.setParameter(SURVEYPORTLETTAKING,takepoll);
                                aurl.setParameter ( "surveyportletcmd", "showform" );
                                String takesurveyURL = aurl.toString();
                                String link = linkt.replace ("xx",takesurveyURL);
                                link = link.replace ("yy",title);
                                urls.add (link);
                                neligible ++;
                            }
                        }
                        eligible = urls.toArray ( new String [0] );
                    }
                } catch ( Exception e ) {
                    eligible = new String [] {e.toString ()};
                }
            }
        } else {
            if ( pollname != null && !"".equals(pollname) )
                pollid = spotname + "!" + pollname;
        }

        // Fix pollid from additional params
        String arparams = (String) psess.getAttribute ( ARATTR );
        if ( arparams != null && arparams.length() > 7 ) {
            String POLLIDEQ  = "&pollid=";
            int pollidix = arparams.indexOf (POLLIDEQ) ;
            if ( pollidix >=0 ) {
                int pollidix2 = arparams.indexOf("&",pollidix+1);
                if ( pollidix2 > pollidix ) {
                    String requestedpollid = arparams.substring (pollidix + POLLIDEQ.length () , pollidix2 );
                    pollid = URLDecoder.decode(requestedpollid,"UTF-8");
                }
            }
        }

        String language = null;
        if ( pollid != null && bUseLocale ) {
            String [] codes = this.getLocalizedPollidAndLanguageCode ( origrequest, locale, pollid, spotname );
            if ( ! "".equals ( codes [1] ) ) {
                pollid = codes [0];
                language = codes [1];
            }
        }

        String pollmsg = bUseLocale
                ? getResBundle ( "takesurvey", locale)
                : prefs.getValue ( "pollmsg", "" );
        if (pollmsg == null || "".equals(pollmsg) )
            pollmsg = "take survey";	//	shouldn't be empty

        renderRequest.setAttribute("pollmsg",pollmsg);
        renderRequest.setAttribute("showeligible",showeligible);
        renderRequest.setAttribute("eligible",eligible);


        String nothingscheduled = getResBundle ( "nosurveyscheduled", locale);
        String viewresultsmsg = getResBundle ( "viewresults", locale);
        String surveyalreadycompleted = getResBundle ( "surveyalreadycompleted", locale);

        boolean handledupe = false;
        PortletURL showresulutsurl = renderResponse.createActionURL ();
        showresulutsurl.setParameter ( "surveyportletcmd", "viewresults" );
        showresulutsurl.setParameter ( "surveyportletpollid", pollid );
        showresulutsurl.setWindowState ( WindowState.MAXIMIZED );
        String showResultsLink = showresulutsurl.toString ();

        boolean bHaspollname = pollname != null && !"".equals(pollname) && !" ".equals(pollname) ;
        if ( ! bHaspollname ) {
            if ( showeligible != null && neligible > 0) {
                String choosesurvey = getResBundle ( "choosesurvey", locale );
                renderRequest.setAttribute ( "status", choosesurvey );
            } else {
                renderRequest.setAttribute ( "status", nothingscheduled );
            }
        }
        else {

            if ( "*".equals(pollname) && spotname != null && spotname.length () > 0 ) {
                //	automatic scheduling from application. Find out what's current.
                String getcurrentpoll = "lry-op=vfapi&cmd=getpollnames&status=current&spotname=" + spotname ;
                String currentpollid;
                try {
                    currentpollid = Utility.GetRequest ( lryjsp, getcurrentpoll );
                } catch ( Exception e ) {
                    currentpollid = e.toString ();
                }
                if ( currentpollid != null && ! "-1".equals (currentpollid) && ! "".equals (currentpollid) ) {
                        pollid = currentpollid;
                }
            }

            renderRequest.setAttribute ( "showResultsLink", showResultsLink );
            renderRequest.setAttribute ( "viewresultsmsg", viewresultsmsg );

            if ( bMaximized && ( "link".equals ( pollembedorlink ) || " ".equals ( pollembedorlink ) ) )
                pollembedorlink = "embed";
            if ( "link".equals ( pollembedorlink ) || " ".equals ( pollembedorlink ) ) {
                //  TODO Use ifvoted to see if a duplicate or not.
                String ifvoteduri = "lry-op=vfapi&cmd=ifvoted&verbose=1&spotname=" + spotname
                        + "&pollid=" + pollid
                        + "&lry-userid=" + fuserid;
                String ifvotedattributeret;
                try {
                    ifvotedattributeret = Utility.GetRequest ( lryjsp, ifvoteduri );
                } catch ( Exception e ) {
                    ifvotedattributeret = e.toString ();
                }

                String ifvoted = "";
                if ( ifvotedattributeret != null && ifvotedattributeret.length () > 0 ) {
                    ifvoted = ifvotedattributeret.substring (0,1);
                }
                //  Ifvoted: 0 means no; 1 means yes; 2 means nothing scheduled? 3 means no auth
                switch (ifvoted) {
                    case "0":   //  no, and others (don't know what they mean)
                    default:
                        renderRequest.setAttribute ( "pollembedorlink_is_link", "" );
                        //  Link to maximized version of this page
                        PortletURL turl = renderResponse.createRenderURL ();
                        turl.setWindowState ( WindowState.MAXIMIZED );
                        turl.setPortletMode ( PortletMode.VIEW );
                        String fullPagePortletURL = turl.toString ();
                        renderRequest.setAttribute ( "fullPagePortletURL", fullPagePortletURL );
                        if ( "checked".equals ( pollresultslink ) )
                            renderRequest.setAttribute ( "viewresultslink", "" );
                        break;
                    case "1":   //  yes
                        handledupe = true;
                        break;
                }

            } else {
                if  ( psess.getAttribute ( "viewresults" ) != null  ) {
                    psess.removeAttribute ( "viewresults" );
                    String resultshtml = viewResults ( lryjsp, pollid, language );
                    renderRequest.setAttribute ( "viewresultsshow", "" );
                    renderRequest.setAttribute ( "viewresultsbody", resultshtml );
                    continuelink = continueLink ( "viewresults", renderResponse, locale );
                }
                else {
                    String vfurl = "lry-op=viewsflash&lry-userid=" + fuserid;
                    vfurl += "&lry-time=" + System.currentTimeMillis ();
                    vfurl += "&com.cogix.vwf.isportal=true";
                    // TBD add parameters from ActionRequest, stored in session, in processAction
                    // PortletSession psess = renderRequest.getPortletSession(true);
                    // psess.setAttribute ( VIEWSFLASHADDTIONALPARAMETERS , ht, PortletSession.PORTLET_SCOPE ) ;

                    psess.removeAttribute ( ARATTR );
                    if ( arparams != null )
                        vfurl += arparams;
                    if ( vfurl.indexOf ( "&cmd=" ) < 0 )
                        vfurl += "&cmd=page";
                    if ( vfurl.indexOf ( "&pollid=" ) < 0 )
                        vfurl += "&pollid=" + URLEncoder.encode ( pollid, "UTF-8" );
                    vfurl += "&random-value" + System.currentTimeMillis ();

                    // "http://mini.cogix.com:8080/ViewsFlash/servlet/viewsflash?lry-op=viewsflash&cmd=page&pollid=Examples!car_satisfaction2";
                    String vfcontent;

                    try {
                        vfcontent = Utility.PostRequest ( lryjsp, vfurl );
                    } catch ( Exception e ) {
                        vfcontent = e.toString ();
                    }
                    if ( vfcontent != null ) {
                        if ( vfcontent.startsWith ( "No ID" ) ) {
                            vfcontent = getResBundle ( "login", locale );
                        }
                        String p = Utility.ViewsFlashURL ( origrequest, true );
                        String ViewsFlashURL = Utility.ViewsFlashURL ( origrequest );
                        if (  ! ViewsFlashURL.equals ( p ) ) {
                            // Inject VF url where missing for remote server
                            String viewsflashurl = "\"" + ViewsFlashURL;
                            vfcontent = vfcontent.replaceAll ( "\"/ViewsFlash", viewsflashurl ); // src="ViewsFlash/..
                            vfcontent = vfcontent.replaceAll ( "\"/viewsFlash", viewsflashurl + "/viewsflash" );  // src="ViewsFlash/style..."
                        }
                        // Disable  src="/ViewsFlash/js and href="/ViewsFlash/styles"
                        vfcontent = vfcontent.replaceAll ( "src=\"/ViewsFlash/js", " xsrc=\"WasViewsFlashJs" ); // src="ViewsFlash/..
                        vfcontent = vfcontent.replaceAll ( "href=\"/ViewsFlash/styles", " xhref=\"/wasViewsFlash/styles" ); // src="ViewsFlash/..

                    /* problem with url of nop.gif (the header)
                    // TODO: distinguish between results page for 1st time completion and dupe detected...?
                    Search in page for ViewsFlashPortletPage=
                    Values could be: R = response page;  S = save page; number = page number
                    If none, <vwfsavesurvey> implies savepage
                    -If save page, show the Continue link, nothing else;
                    -If on page number 0, not maximized, and checked=pollresultslink, enable ViewResutls link (which does what???)
                    -If on response page, show returntoportal link and Continue link below it
                     */
                        int pageAt = getPageAt ( vfcontent );
                        if ( pageAt == -3 || vfcontent.startsWith ( "<vwfsavesurvey>" ) ) {
                            // save page
                            psess.removeAttribute ( SURVEYPORTLETTAKING );
                            vfcontent = getResBundle ( "savesurvey", locale );
                            continuelink = continueLink ( "save page", renderResponse, locale );
                        }

                        // Form page and results pages
                        renderRequest.setAttribute ( "iframesrc", vfcontent );
                        renderRequest.setAttribute ( "iframe", "" );
                        if ( pageAt == -2 ) { // duplicate
                            handledupe = true;
                        } else
                        if ( pageAt >= 0 ) {
                            renderRequest.setAttribute ( "formtag", "" ); // enables form tag
                            PortletURL furl = renderResponse.createActionURL ();
                            renderRequest.setAttribute ( "formactionurl", furl.toString () );
                            String allalphapollid = pollid.replaceAll ( "[^A-Za-z0-9 ]", "" );
                            renderRequest.setAttribute ( "allalphapollid", allalphapollid );
                            renderRequest.setAttribute ( "pollid", pollid );
                            if ( pageAt == 0 && "checked".equals ( pollresultslink ) )
                                renderRequest.setAttribute ( "viewresultslink", "" );

                        } else {
                            // Results page
                            continuelink = continueLink ( "response page", renderResponse, locale );
                            psess.removeAttribute ( SURVEYPORTLETTAKING );
                        }

                    }
                }
            }
        }
        if ( handledupe ) {
            psess.removeAttribute ( SURVEYPORTLETTAKING );
            renderRequest.setAttribute ( "iframe",null);

            switch ( pollresultsaftercompleting ) {
                case "checked":
                    String resultshtml = viewResults (lryjsp, pollid,language);
                    renderRequest.setAttribute ( "viewresultsshow","" );
                    renderRequest.setAttribute ( "viewresultsbody",resultshtml );
                    // continuelink = continueLink ( "response page", renderResponse, locale );
                    break;
                case "displaylinktoresults":
                    renderRequest.setAttribute ( "viewresultslink", "" );
                    renderRequest.setAttribute ( "showResultsLink", showResultsLink );
                    renderRequest.setAttribute ( "viewresultsmsg", viewresultsmsg );
                    break;
                case "nothing":
                    if ( "checked".equals ( pollresultslink ) )
                        renderRequest.setAttribute ( "viewresultslink", "" );
                    break;
                case "displayalreadycompletedmessage":
                default:
                    renderRequest.setAttribute ( "status", surveyalreadycompleted );
                    if ( "checked".equals ( pollresultslink ) )
                        renderRequest.setAttribute ( "viewresultslink", "" );
            }

        }
        renderRequest.setAttribute ( "continuelink", continuelink );
        String viewjsp = "/view.jsp?" + System.currentTimeMillis ();
        PortletRequestDispatcher rd = this.getPortletContext ().getRequestDispatcher ( viewjsp );
        rd.include(renderRequest,renderResponse);
        int xxx = 5;
    }

    /* This would have been used if we could load the ViewsFlash app and servlet

    static String VIEWSFLASH = "/o/ViewsFlash/servlet/viewsflash";
    static String ME = "com.cogix.surveyportlet.include";

    String include ( PortletRequest req, PortletResponse res, String querystring) throws PortletException, IOException {
        PortletRequestDispatcher rd = this.getPortletContext ().getRequestDispatcher ( VIEWSFLASH );
        req.setAttribute ( "com.cogix.vwf.api", System.currentTimeMillis () );    //	set this attribute to the current time to establish security credentials
        querystring += "&outputtorequestattribute="+ME;
        req.setAttribute("com.cogix.vwf.onlyquery", querystring);
        rd.include (req,res);
        return (String) req.getAttribute ( ME );
    }
    */

    String  viewResults (String vfapp, String pollid, String language) {

        String seeresults = "lry-op=vfapi&cmd=seeresults&pollid=" + pollid;
        seeresults += "&com.cogix.vwf.isportal=true";
        seeresults += "&lry-time=" + System.currentTimeMillis ();
        if ( language != null )
            seeresults += "&results=" + pollid + ".results.html";
        String resultshtml;
        try {
            resultshtml = Utility.GetRequest ( vfapp , seeresults );
        } catch ( Exception e ) {
            resultshtml = e.toString ();
        }
        return resultshtml;
    }

    static final String ARATTR = "ActionParams";

    public void InView () {
    }

    int getPageAt ( String content ) {
        if ( content == null || content.equals ( "" ) )
            return -99;   //  can't tell
        String RESPONSEMARKER = "ViewsFlashPortletPage=";
        int ix = content.indexOf ( RESPONSEMARKER );
        if ( ix < 0 )
            return -99;   //  can't tell what this is
        int ix2 = ix + RESPONSEMARKER.length ();
        if ( ix2 >= content.length () )
            return -99;
        if ( content.charAt ( ix2 ) == 'R' )
            return -1;  //  response page
        if ( content.charAt ( ix2 ) == 'S' )
            return -2;  //  save page
        int ispace = content.indexOf ( ' ', ix2 );
        if ( ispace == 0 )
            return -99;   //  can't tell what this is
        String pagenumber = content.substring ( ix2, ispace );
        int pageno;
        try {
            pageno = Integer.parseInt ( pagenumber );
        } catch ( NumberFormatException ignored ) {
            pageno = -99;
        }
        return pageno;
    }


    @Override
    public void processAction( ActionRequest actionRequest, ActionResponse actionResponse) throws PortletException, IOException {

        PortletSession psess = actionRequest.getPortletSession(true);
        PortletMode pm = actionRequest.getPortletMode();
        boolean bEditDefaults = pm.toString().equals ("edit_defaults");
        boolean bConfig = pm.toString().equals ("config");
        boolean bConfigMode = "config".equals ( actionRequest.getParameter ("cogixmode") );
        String takepollid = actionRequest.getParameter (SURVEYPORTLETTAKING) ;
        if ( takepollid != null &&  "~".equals(takepollid) ) {
            try {
                actionResponse.setRenderParameter("spotname","");
            } catch (Exception ignored) {}
            psess.removeAttribute(SURVEYPORTLETTAKING);
        }
        else if ( takepollid != null && ! "".equals(takepollid) ) {
            //  1.1 Using chooser. Set survey default in session attribute,
            //  to be picked up by SurveyContent.jsp
            try {
                psess.setAttribute(SURVEYPORTLETTAKING, takepollid );
                putParamsInSessionString (actionRequest);
            } catch (Exception ignored) {}
        }
        else if ( PortletMode.VIEW.equals (pm) && ! bConfigMode ) {
            //  if TARGETJSP parameter included in the URL, that becomes the current jsp page

                putParamsInSessionString (actionRequest);
        }
        if ( "viewresults".equals(actionRequest.getParameter ( "surveyportletcmd" ) ) ) {
            psess.setAttribute ( "viewresults","1" );
        }
    }

    void putParamsInSessionString ( ActionRequest actionRequest) throws UnsupportedEncodingException {
        //  Create hashtable and put into portlet session with application scope
        StringBuilder ht = new StringBuilder (  );

        Enumeration pnames = actionRequest.getParameterNames ();
        while ( pnames.hasMoreElements() ) {
            String pname = (String) pnames.nextElement();
            if ( pname != null ) {
                String [] pvalues = actionRequest.getParameterValues (pname) ;
                if ( pvalues != null ) {
                    if ( pvalues.length <= 0 )
                        continue;
                    String v;
                    if ( pvalues.length == 1 ) {
                        // TDOO do URL encoding here
                        v = URLEncoder.encode ( pvalues[0], "UTF-8" );
                        ht.append ( "&" ).append ( pname ).append ( "=" ).append ( v );
                    }
                    else {
                        // TDOO do URL encoding here; don't encode the commas
                        for (int k = 0; k< pvalues.length; k++ ) {
                            v = URLEncoder.encode(pvalues[k],"UTF-8") ;
                            ht.append ( "&" ).append ( pname ).append ( "=" ).append ( v );
                        }
                    }
                }
            }
        }
        PortletSession psess = actionRequest.getPortletSession(true);
        psess.setAttribute ( ARATTR, ht.toString () );
    }


    public String getResBundle ( String key, Locale lc ) {
        String s;
        try {

            s = this.getResourceBundle ( lc ).getString (key);
            /*

            ResourceBundle rb = ResourceBundle.getBundle ( f, lc );
            s = rb.getString ( key );
            */
        }
        catch ( MissingResourceException e ) {
            s = null;
        }
        if ( s == null || "".equals ( s ) )
            return key;
        return s;
    }

    public String continueLink (String id, RenderResponse renderResponse, Locale locale ) {
        try {
            PortletURL curl2 = renderResponse.createRenderURL ();
            curl2.setWindowState ( WindowState.NORMAL );
            curl2.setPortletMode ( PortletMode.VIEW );
            String continueURL2 = curl2.toString ();
            String continuebundle = getResBundle ( "continue", locale );
            String continuelink = "<!--continue link triggered by " + id  + "--> " +
                    "<a href=\"" + continueURL2 + "\">" + continuebundle + "</a><br />";
            return continuelink;
        } catch ( WindowStateException | PortletModeException e ) {
            return "";
        }
    }

    String[] getLocalizedPollidAndLanguageCode ( HttpServletRequest httpServletRequest, Locale locale, String pollid, String spotname ) {
        String[] result = new String[2];
        String[] pollidsplit = splitIntoPollidAndLanguageCode ( pollid );
        if ( !"".equals ( pollidsplit[ 1 ] ) ) {
            //  If user chose a localized ID in configuration, then let him have his choice
            result[ 0 ] = pollid;
            result[ 1 ] = "";
            return result;
        }


        String lryjsp = Utility.ViewsFlashURL ( httpServletRequest ) + lrydotjsp;
        String getpollnames = "lry-op=vfapi&cmd=getpollnames&status=open&isscheduled=1&sort=alpha&spotname=" + spotname ;
        String pnames;
        try {
            pnames = Utility.GetRequest ( lryjsp,  getpollnames );
        } catch ( Exception e ) {
            pnames = e.toString ();
        }

        String [] pollnames = pnames.split ("\\|" );

        //  pollid would be underlying poll, e.g., base
        //  there are two cases:  multilanguage, with base and some (but not all)   base__es base__fr etc., created, and there could even be base__fr_CN as well.
        //  So our job here is to return the pollid at the most specific language level that exists, namely:
        //  pollid _ _  lang _ country,    pollid _ _ lang,  pollid

        String language = locale.toString ();
        String pid = pollid + "__" + language;   //  full language version  pollid__es_CL in ViewsFlash pollid notation

        if ( Arrays.binarySearch ( pollnames,pid ) >= 0 ) {
            result[ 0 ] = pid;
            result[ 1 ] = language;
            return result;
        }
        language = locale.getLanguage ();
        pid = pollid + "__" + language;     // language only version  pollid__es

        if ( Arrays.binarySearch ( pollnames,pid ) >= 0 ) {
            result[ 0 ] = pid;
            result[ 1 ] = language;
            return result;
        }
        //  neither one exists, default to the no language version
        result[ 0 ] = pollid;
        result[ 1 ] = "";
        return result;
    }


    public String[] splitIntoPollidAndLanguageCode(String pollid) {
        String[] ans = new String[]{pollid, ""};
        if(pollid == null) {
            return ans;
        } else {
            int len = pollid.length();
            if(len < 7) {
                return ans;
            } else {
                int languagelast;
                if(pollid.charAt(len - 6) != 95) {
                    if(pollid.charAt(len - 3) != 95) {
                        return ans;
                    }

                    if(pollid.charAt(len - 4) != 95) {
                        return ans;
                    }

                    languagelast = len - 3;
                } else if(pollid.charAt(len - 7) == 95) {
                    languagelast = len - 6;
                } else {
                    if(pollid.charAt(len - 3) != 95 || pollid.charAt(len - 4) != 95) {
                        return ans;
                    }

                    languagelast = len - 3;
                }

                int languagefirst = languagelast - 1;
                ans[0] = pollid.substring(0, languagefirst);
                ans[1] = pollid.substring(languagelast + 1);
                return ans;
            }
        }
    }


}