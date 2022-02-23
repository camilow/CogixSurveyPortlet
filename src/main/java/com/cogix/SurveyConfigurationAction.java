package com.cogix;

import aQute.bnd.annotation.metatype.Configurable;
import com.cogix.vwf.Belize;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.Role;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.module.configuration.ConfigurationProvider;
import com.liferay.portal.kernel.portlet.ConfigurationAction;
import com.liferay.portal.kernel.portlet.DefaultConfigurationAction;
import com.liferay.portal.kernel.util.ParamUtil;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.ConfigurationPolicy;
import org.osgi.service.component.annotations.Modified;
import org.osgi.service.component.annotations.Reference;

import javax.portlet.ActionRequest;
import javax.portlet.ActionResponse;
import javax.portlet.PortletConfig;
import javax.portlet.PortletPreferences;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.net.URLEncoder;
import java.util.List;
import java.util.Map;
import java.util.Vector;

import static com.liferay.portal.kernel.util.PortalUtil.getUser;

// Reference: https://dev.liferay.com/develop/tutorials/-/knowledge_base/7-0/making-your-applications-configurable

@Component(
        configurationPid = "com.cogix.Configuration",
        configurationPolicy = ConfigurationPolicy.OPTIONAL,
        immediate = true,
        property = {
                "javax.portlet.name=Survey_WAR_ViewsFlash"
                //"javax.portlet.name=com_cogix_SurveyPortlet"

        },
        service = ConfigurationAction.class
)
public class SurveyConfigurationAction extends DefaultConfigurationAction {
    private volatile Configuration _configuration;
    static private final String version="0";

    @Reference
    private ConfigurationProvider _configurationProvider;

    @Override
    public String getJspPath(HttpServletRequest request) {
        return "/config.jsp";
    }

    @Override
    public void processAction(
            PortletConfig portletConfig, ActionRequest actionRequest,
            ActionResponse actionResponse)
            throws Exception {
        String newspot = ParamUtil.getString(actionRequest, "newspot");
        if ( newspot == null ||  "".equals (newspot) ) {
            // submitting second form; re-save spotname, just in case it doesn't remember it
            PortletPreferences portletPreferences = actionRequest.getPreferences (); // This works !!!
            String spotname = portletPreferences.getValue( "spotname", "Examples");
            setPreference(actionRequest, "spotname", spotname );

            setPreference(actionRequest, "uselocale", ParamUtil.getString(actionRequest, "uselocale"));
            setPreference(actionRequest, "pollname", ParamUtil.getString(actionRequest, "pollname"));
            setPreference(actionRequest, "pollmsg", ParamUtil.getString(actionRequest, "pollmsg"));
            setPreference(actionRequest, "pollembedorlink", ParamUtil.getString(actionRequest, "pollembedorlink"));
            setPreference(actionRequest, "pollresultsaftercompleting", ParamUtil.getString(actionRequest, "pollresultsaftercompleting"));
            setPreference(actionRequest, "pollresultslink", ParamUtil.getString(actionRequest, "pollresultslink"));

        } else {
            // spotname changed, submitting first form
            String spotname = ParamUtil.getString(actionRequest, "spotname");
            if (spotname != null ) {
                setPreference ( actionRequest, "spotname", spotname );
                setPreference(actionRequest, "pollname", "");
            }
        }
        super.processAction(portletConfig, actionRequest, actionResponse);
    }

    @SuppressWarnings("Duplicates")
    static public String getEncryptedId (String userid, User userobj) {

        StringBuilder isuserinrole = new  StringBuilder();

        try {
            if ( userobj != null ) {
                List<Role> roles =userobj.getRoles();
                if ( roles != null )
                    for ( Role r : roles )
                        isuserinrole.append(r.getName()).append(",");
                List<Group> groups = userobj.getGroups ();
                if ( groups != null )
                    for ( Group g: groups )
                        isuserinrole.append ( g.getNameCurrentValue ()).append(",");

            }
            String encrypted = userid + "|" + isuserinrole.toString ();
            if ( encrypted.length () > 0 )
                encrypted = encrypted.substring ( 0,encrypted.length ()-1 );
            String encrypteduseridandroles = SurveyPortlet.belize.encrypt ( encrypted ); //userid|role,role,role
            encrypteduseridandroles = URLEncoder.encode(encrypteduseridandroles, "UTF-8");
            return encrypteduseridandroles;
        } catch (Throwable th) {
            return th.toString ();
        }
    }

    // Runs after include, has access to prefrences
    public void processPreferences ( PortletPreferences portletPreferences, HttpServletRequest httpServletRequest) {
        String lryjsp = Utility.ViewsFlashURL ( httpServletRequest ) + SurveyPortlet.lrydotjsp;
        String  hidepollselect = "";
        boolean noframe = SurveyPortlet.CannotiframeUI (httpServletRequest);
        httpServletRequest.setAttribute ("noframe", noframe ? "x" : "");

        String spotname = portletPreferences.getValue( "spotname", "Examples");
        String pollname = portletPreferences.getValue( "pollname", "car_purchase");

        Vector<Utility.SelectOption> spotnames = new Vector<> (  );
        spotnames.add ( new Utility.SelectOption (" ","None") );
        spotnames.add ( new Utility.SelectOption ("**","Show all eligible") );
        // eligible spot names
        String userid;
        User userobj = null;
        try {
            userobj = getUser(httpServletRequest); // getScreenName gives name
            userid = Utility.getUserName ( userobj );
        } catch ( Exception e ) {
            userid=e.toString ();
        }

        String encryid = getEncryptedId (userid,userobj);
        String spnames;
        try {
            String getspotnames = "lry-op=vfapi&lry-userid=" + encryid + "&cmd=getspotnames&security=user";
            spnames = Utility.GetRequest ( lryjsp, getspotnames );
        } catch ( Exception e ) {
            spnames = e.toString ();
        }

        /*
        StringBuilder isuserinrole = new  StringBuilder();
        try {
            if ( userobj != null ) {
                List<Role> roles =userobj.getRoles();
                if ( roles != null )
                    for ( Role r : roles )
                        isuserinrole.append(r.getName()).append(",");
                List<Group> groups = userobj.getGroups ();
                if ( groups != null )
                    for ( Group g: groups )
                        isuserinrole.append ( g.getNameCurrentValue ()).append(",");

            }
        } catch (Throwable ignore) {
            int xhyz = 99;
        }
        String lryjsp = Utility.ViewsFlashURL ( httpServletRequest ) + SurveyPortlet.lrydotjsp;
        try {
            String encrypted = userid + "|" + isuserinrole.toString ();
            if ( encrypted.length () > 0 )
                encrypted = encrypted.substring ( 0,encrypted.length ()-1 );
            String fuserid = SurveyPortlet.belize.encrypt ( encrypted ); //userid|role,role,role
            fuserid = URLEncoder.encode(fuserid, "UTF-8");
            String getspotnames = "lry-op=vfapi&lry-userid=" + fuserid + "&cmd=getspotnames&security=user";
            spnames = Utility.GetRequest ( lryjsp, getspotnames );
        } catch ( Exception e ) {
            spnames = e.toString ();
        }
        */
        String [] spnm = spnames.split(",");
        for ( String s: spnm ) {
            spotnames.add ( new Utility.SelectOption (s) );
        }
        String spotnameoptions = Utility.constructSelectOptions (spotnames ,spotname );
        httpServletRequest.setAttribute ("spotnameoptions", spotnameoptions);
        httpServletRequest.setAttribute ("spotname", spotname);

        boolean havespotname = spotname != null && !spotname.equals ("") && !spotname.equals (" ") && !spotname.equals ("**") ;


/*         http://me.cogix.com:8080/ViewsFlash/servlet/viewsflash?cmd=getpollnames&status=open&title=1&sort=alpha&smp=1&isscheduled=1&spotname=Examples
Examples!Branching'title='smp=m|Examples!Estimates'title='smp=m|Examples!Grid'title=2007 School Assessment'smp=m|Examples!Service'title='smp=m|Examples!Two_Qualities'title='smp=m|Examples!car_brands'title='smp=m|Examples!car_purchase'title=Car purchase'smp=m|Examples!car_satisfaction'title=Car satisfcation'smp=m|Examples!car_satisfaction2'title=Car satisfaction with layout'smp=m|Examples!shelley'title=Car satisfaction with layout'smp=m
Examples!Branching'title='smp=m|Examples!Estimates'title='smp=m|Examples!Grid'title=2007 School Assessment'smp=m|Examples!Service'title='smp=m|Examples!Two_Qualities'title='smp=m|Examples!car_brands'title='smp=m|Examples!car_purchase'title=Car purchase'smp=m|Examples!car_satisfaction'title=Car satisfcation'smp=m|Examples!car_satisfaction2'title=Car satisfaction with layout'smp=m|Examples!shelley'title=Car satisfaction with layout'smp=m
*/
        Vector<Utility.SelectOption> pollnames = new Vector<> (  );
        String pnames = null;
        if ( havespotname ) {
            try {
                String getpollnames = "lry-op=vfapi&cmd=getpollnames&status=open"
                        + "&title=1&sort=alpha&smp=1&isscheduled=1"
                        + "&spotname=" + spotname ;
                pnames = Utility.GetRequest ( lryjsp, getpollnames );
            } catch ( Exception e ) {
                pnames = e.toString ();
            }
        } else {
            // Hide poll dropdown when spot is None or alleligibile
            hidepollselect = "invisible";
            httpServletRequest.setAttribute ("hidepollselect", hidepollselect);
        }
        // Special cases: pnames = *, show */Rotate Automatically
        // -1 = ' ' / No questionnaires open
        //
        // Get pollnames dropdown
        if ( pnames != null && pnames.length() >= 2  ) {
            if ( pnames.charAt(0) == '*' ) {
                pollnames.add ( new Utility.SelectOption ( "*", "Rotate automatically") );
            } else if ("-1".equals(pnames) ) {
                pollnames.add ( new Utility.SelectOption ( " ", "No questionnaires open") );
            } else {
                pollnames.add ( new Utility.SelectOption ( " ", "None") );
                String[] pnm = pnames.split ("\\|" );
                for ( String s : pnm ) {
                    // s: Examples!Branching or title= or smp=
                    String[] parts = s.split ( "'" );
                    if ( parts.length < 1 )
                        continue;
                    String pollid = parts[0];
                    String[] pollidp = pollid.split ( "!" );
                    if ( pollidp.length < 2 )
                        continue;
                    String title = parts.length > 1 ? parts[1] : parts[0];
                    if ( title.startsWith ( "title=" ) && title.length() > 6 )
                        title = title.substring (6);
                    else
                        title = pollidp[1];
                    pollnames.add ( new Utility.SelectOption ( pollidp[1], title ) );
                }
            }
        }
        String pollnameoptions = Utility.constructSelectOptions ( pollnames, pollname );
        httpServletRequest.setAttribute ("pollnameoptions", pollnameoptions);

        String pollmsg = portletPreferences.getValue( "pollmsg", "");
        httpServletRequest.setAttribute ("pollmsg", pollmsg);

        String pollembedorlink = portletPreferences.getValue( "pollembedorlink", "link");
        httpServletRequest.setAttribute ("pollembedorlink", pollembedorlink);

        String pollresultsaftercompleting = portletPreferences.getValue( "pollresultsaftercompleting", "checked");
        httpServletRequest.setAttribute ("pollresultsaftercompleting", pollresultsaftercompleting);

        String pollresultslink = portletPreferences.getValue( "pollresultslink", "checked");
        httpServletRequest.setAttribute ("pollresultslink", pollresultslink);

        String uselocale = portletPreferences.getValue( "uselocale", "unchecked");
        httpServletRequest.setAttribute ("uselocale", uselocale);
        /*
        String fuserid = SurveyPortlet.belize.encrypt (userid);
        try {
            fuserid = URLEncoder.encode(fuserid,"UTF-8");
        } catch ( UnsupportedEncodingException e ) {
            fuserid=e.toString ();
        }
        */
        String servlet = "lry-op=vfadmin&lry-userid=" + encryid + "&";
        String cmd = null;
        if ( spotname != null && ! "".equals(spotname) && ! "**".equals(spotname) ) {
            if ( ! " ".equals(spotname) ) {
                if ( pollname != null && ! pollname.equals("*") && ! pollname.equals(" ") && ! pollname.equals("") )
                    cmd = "cmd=dfpoll&filledout=force&pollid=" + spotname + "!" + pollname ;
                else
                    cmd = "cmd=dfusrspot&spotname=" + spotname;
            }
        }
        if ( cmd == null )
            cmd = "cmd=dfspots";
        servlet += cmd;
        String vfurl;
        try {
            vfurl = lryjsp + "?" + servlet; // Balaffle.GetBalaffle ( null ).encrypt ( servlet );
            String key = Belize.key();
            vfurl += "&lry-bz=" + key;
        } catch ( Exception e ) {
            e.printStackTrace ();
            vfurl = e.toString ();
        }
        vfurl += "&lry-t="+System.currentTimeMillis ();
        httpServletRequest.setAttribute ("surveySetupurl", vfurl);
    }
/*
    private String ViewsFlashAPIInclude ( HttpServletRequest req, HttpServletResponse res, String querystring) throws IOException, ServletException {
            this.getPortletContext ().getRequestDispatcher ( VIEWSFLASH );
            RequestDispatcher rd = req.getServletContext ().getRequestDispatcher ( VIEWSFLASH );
            querystring += "&outputtorequestattribute="+ME;
            req.setAttribute("com.cogix.vwf.onlyquery", querystring);
            req.setAttribute ( "com.cogix.vwf.api", System.currentTimeMillis () );    //	set this attribute to the current time to establish security credentials
            rd.include (req,res);
            return (String) req.getAttribute ( ME );
        }
*/
        @Override
    public void include(
            PortletConfig portletConfig, HttpServletRequest httpServletRequest,
            HttpServletResponse httpServletResponse) throws Exception {

        httpServletRequest.setAttribute(
                Configuration.class.getName(),
                _configuration );

        httpServletRequest.setAttribute ( "SurveyConfigurationAction",this );

        super.include(portletConfig, httpServletRequest, httpServletResponse);
    }

    @Activate
    @Modified
    protected void activate(Map<Object, Object> properties) {
        _configuration = Configurable.createConfigurable(
                Configuration.class, properties);
    }


}
