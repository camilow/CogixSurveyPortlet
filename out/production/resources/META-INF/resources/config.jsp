<%@ page import="com.cogix.SurveyConfigurationAction" %>
<%@ page import="com.liferay.portal.kernel.util.Constants" %>
<%@ page import="javax.portlet.PortletPreferences" %>

<%@ taglib prefix="liferay-theme" uri="http://liferay.com/tld/theme" %>
<%@ taglib prefix="liferay-portlet" uri="http://liferay.com/tld/portlet" %>
<%@ taglib prefix="aui" uri="http://liferay.com/tld/aui" %>
<%@ taglib prefix="portlet" uri="http://java.sun.com/portlet_2_0" %>

<portlet:defineObjects/>
<%
    PortletPreferences pp = portletPreferences;
    SurveyConfigurationAction sca = (SurveyConfigurationAction) request.getAttribute ("SurveyConfigurationAction");
    sca.processPreferences (pp,request);
%>

<liferay-portlet:actionURL portletConfiguration="<%= true %>"
                           var="configurationActionURL"/>

<liferay-portlet:renderURL portletConfiguration="<%= true %>"
                           var="configurationRenderURL"/>
<style>
    .vfselectelmt { color:black !important;}
    .vfnavlinkactive {font-size:110%; font-weight: bold; margin-right:20px; text-decoration:none;}
    .vfnavlink {font-size:100%; font-weight:normal; margin-right:20px; }
    #SurveyPortletConfig { margin: 60px 5px 5px 30px;}
    .invisible { display:none;}
</style>

<div id="SurveyPortletConfig">
<div id="vfportletnav">
    <a id="vfconfigureportletlink" class="vfnavlinkactive" href="javascript:void(0);"
       onclick="vftogtab('vfconfigureportlet','vfconfiguresurveys');"
       xonclick="document.getElementById('editform').submit();" >Configure Portlet</a>
    <a id="vfconfiguresurveyslink" class="vfnavlink" href="javascript:void(0);" onclick="vftogtab('vfconfiguresurveys','vfconfigureportlet');">Configure Surveys</a>&nbsp;&nbsp;
</div>
<div style="display:table; width:100%; height:100%;">
    <div style="display:table-row">
        <div id="vfconfigureportlet" style="display: table-cell;  width:300px; ">
            <form action="<%= configurationActionURL %>" method="post" name="editform" id="editform">
                <br/><!--  107 -->
                Select what questionnaire to use in this portlet:
                <%
                    String spotname = (String) request.getAttribute ( "spotname" );
                    String pollembedorlink = (String) request.getAttribute ( "pollembedorlink" );
                    String pollmsg = (String) request.getAttribute ( "pollmsg" );
                    String pollresultslink = (String) request.getAttribute ( "pollresultslink" );
                    String pollresultsaftercompleting = (String) request.getAttribute ( "pollresultsaftercompleting" );
                    String uselocale = (String) request.getAttribute ( "uselocale" );
                    String surveySetupurl = (String) request.getAttribute ( "surveySetupurl" );
                    String noframe        = (String) request.getAttribute ( "noframe" );


                %>
                <div style="display:none"> spotname is <%=spotname%> </div>
                <div>Place &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <select name="<portlet:namespace/>spotname"  class="vfselectelmt"
                            onChange="onSpotChange()" >
                        <%=request.getAttribute ( "spotnameoptions" )%>
                    </select>
                </div>
                <input id="newspot" type="hidden" name="<portlet:namespace/>newspot" value="">
                <aui:input name="<%= Constants.CMD %>" type="hidden"
                           value="<%= Constants.UPDATE %>"/>
                <aui:input name="redirect" type="hidden"
                           value="<%= configurationRenderURL %>"/>

            </form>
            <form name="editform2" id="editform2" name="editform2" method="post" action="<%= configurationActionURL %>"  >
                <div class="<%=request.getAttribute ( "hidepollselect" )%>"><br/>Questionnaire
                    <select name="<portlet:namespace/>pollname" class="vfselectelmt" >
                        <%=request.getAttribute ( "pollnameoptions" )%>
                    </select>
                </div>
                <div><br/>
                    Display the questionnaire:<br>
                    <input name="<portlet:namespace/>pollembedorlink" type="radio" value="embed"
                        <%="embed".equals(pollembedorlink) ? "checked" : "" %>
                    > Embedded, in normal portlet mode<br>
                    <input name="<portlet:namespace/>pollembedorlink" type="radio" value="link"
                        <%="link".equals(pollembedorlink) ? "checked" : "" %> > As a link that opens in maximized mode<br/>

                    <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Text for the link:
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input name="<portlet:namespace/>pollmsg" type="text" id="pollmsg" value="<%=pollmsg%>" size="30"><br>
            </span>

                </div>
                <div><br/>
                    Before the questionnaire is completed: <br />
                    <input type="checkbox" name="<portlet:namespace/>pollresultslink" value="checked" <%=pollresultslink%> >
                    Display a link to view results
                </div>
                <div>
                    <div style="display:none">pollresultsaftercompleting is <%=pollresultsaftercompleting%></div>
                    <br/>
                    After the questionnaire is completed:<br />
                    <input type="radio" name="<portlet:namespace/>pollresultsaftercompleting"  value="checked"
                        <%="checked".equals(pollresultsaftercompleting) ? "checked" : "" %>
                    > Display the results instead<br/>
                    <input type="radio" name="<portlet:namespace/>pollresultsaftercompleting" value="displaylinktoresults"
                        <%="displaylinktoresults".equals(pollresultsaftercompleting) ? "checked" : "" %>
                    > Display a link to view results instead<br/>
                    <input type="radio" name="<portlet:namespace/>pollresultsaftercompleting" value="displayalreadycompletedmessage"
                        <%="displayalreadycompletedmessage".equals(pollresultsaftercompleting) ? "checked" : "" %>
                    > Display "already completed" message<br/>
                    <input type="radio" name="<portlet:namespace/>pollresultsaftercompleting" value="nothing"
                        <%="nothing".equals(pollresultsaftercompleting) ? "checked" : "" %>
                    > Don't display anything<br/>

                </div>
                <div><br/>
                    <input type="checkbox" name="<portlet:namespace/>uselocale" value="checked"
                        <%=uselocale%>>
                    Use language from Locale<br/><br/>
                </div>
                <aui:input name="<%= Constants.CMD %>" type="hidden"
                           value="<%= Constants.UPDATE %>"/>
                <aui:input name="redirect" type="hidden"
                           value="<%= configurationRenderURL %>"/>
                <input type="submit" value="Save"/>
            </form>
        </div>
        <div id="vfconfiguresurveys" style="display: none; width:100%;">
            <iframe<%=noframe%> style="width:100%; min-height:800px; border-top:0;"
                    src="<%=surveySetupurl%>" >
            </iframe<%=noframe%>>
        </div>
    </div>
</div>
</div>
<script type="text/javascript">
    function onSpotChange () {
	    document.editform.<portlet:namespace/>newspot.value='spotchanged'
        document.getElementById('editform2').style.display = 'none'
	    document.editform.submit()

    }
    function vftogtab (turnon, turnoff ) {
    	if ( 'vfconfiguresurveys' == turnon && '' != '<%=noframe%>' ) {
    		var features = 'left=50,top=50,location=yes,height=800,width=700,scrollbars=yes,status=yes,resizable=yes'
    		window.open ('<%=surveySetupurl%>','_SurveyPortlet',features)
    		return
	    }
	    var on = document.getElementById(turnon)
		var off= document.getElementById(turnoff)
		off.style.display='none'
		on. style.display='table-cell'
		var onlink = document.getElementById(turnon+'link')
		var offlink= document.getElementById(turnoff+'link')
		onlink.className =  'vfnavlinkactive'
		offlink.className = 'vfnavlink'
	}

    function returntoportal () {
	    var url = document.getElementById('returntoportal');
	    if ( ! url ) return;
	    url = url.value;
	    if ( ! url ) return;
	    if ( window == window.parent ) { // not in a frame
		    window.location = url; // In Liferay 5, this works
	    }
	    else {
		    parent.window.location = parent.window.location; // refresh parent in Liferay 6
	    }
    }

</script>

