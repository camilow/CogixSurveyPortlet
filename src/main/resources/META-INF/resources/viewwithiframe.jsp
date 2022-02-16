<%@ taglib prefix="portlet" uri="http://java.sun.com/portlet_2_0" %>

<portlet:defineObjects/>
<style>
    .anull { display:none;}
    #SurveyPortletiframe { height: 600px; width:1000px; }

</style>

<%
    // SurveyPortlet surveyportlet = (SurveyPortlet) request.getAttribute("SurveyPortlet");

    String nothingscheduled         = (String) request.getAttribute("nothingscheduled");
    String fullPagePortletURL       = (String) request.getAttribute("fullPagePortletURL");
    String pollmsg                  = (String) request.getAttribute("pollmsg");
    String pollembedorlink_is_link  = (String) request.getAttribute("pollembedorlink_is_link");

    String viewresultslink          = (String) request.getAttribute("viewresultslink");
    String showResultsLink          = (String) request.getAttribute("showResultsLink");
    String viewresultsmsg           = (String) request.getAttribute("viewresultsmsg");

    String iframe           = (String) request.getAttribute("iframe");
    String iframesrc           = (String) request.getAttribute("iframesrc");

    // divs with class anull disappear !
%>

<div class="a<%=nothingscheduled%>">
    <!-- no questionnaires scheduled -->
    nothingscheduled!
    <%=nothingscheduled%>
</div>

<div class="a<%=pollembedorlink_is_link%>">
    fullPagePortletURL ! pollmsg !
    <a href="<%=fullPagePortletURL%>"><%=pollmsg%></a>
    <!-- take survey, customized -->
</div>

<div class="a<%=iframe%>" >
    main iframe set iframe = "" to activate;
	iframesrc is <%=iframesrc%>
<iframe id="SurveyPortletiframe"
        src<%=iframe%>="<%=iframesrc%>"
        onload="SurveyPortletonload<%=iframe%>()"></iframe>
</div>

<div class="a<%=viewresultslink%>">
    showResultsLink!  viewresultsmsg!
    <a href="<%=showResultsLink%>"><%=viewresultsmsg%></a>
    <!-- view results -->
</div>
<div class="anull">this div should not be visible </div>
<script type="text/javascript">
	function SurveyPortletonload () {
		window.scrollTo(0,0) // Not a good idea if form is half way down the page; perhaps memorize this?
	}
	function SurveyPortletonloadnull () {}
	SurveyPortletonloadnull()
</script>
<!--
<script>
	function loaded () {
		var iframe = document.getElementById('VFiframe')
		var ifdoc = iframe.contentDocument || iframe.contentWindow.document
		var forms = ifdoc.getElementsByTagName('form')

Search in page for ViewsFlashPortletPage=
Values could be: R = response page;  S = save page; number = page number
If none, <vwfsavesurvey> implies savepage
-If save page, show the Continue link, nothing else;
-If on page number 0, not maximized, and checked=pollresultslink, enable ViewResutls link (which does what???)
-If on response page, show returntoportal link and Continue link below it

What happens if already completed??? "questionnaire already completed";
could add <vwfalreadycompleted> or ViewsFlashPortletPage=D (duplicate)




		var vfcontinue = document.getElementById('VFcontinue')
		if ( forms.length > 0) {
			// a form on the page
		} else {
			// Test for a save/resume page ( how does portlet do it?)
		}
		vfcontinue.style.display = forms.length > 0 ? 'none' : 'block'
		// iframe.contentWindow.scrollTo(0,0);
		window.scrollTo(0,0)
		// debugger; // Debuggerhere

	}
	function VFcontinue() {
		var iframe = document.getElementById('VFiframe')
		iframe.src = '<.%=src%>'
	}
</script>
-->