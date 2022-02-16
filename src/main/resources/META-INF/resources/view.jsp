<%@ page import="com.cogix.SurveyPortlet" %>
<%@ taglib prefix="portlet" uri="http://java.sun.com/portlet_2_0" %>
<portlet:defineObjects/>
<style>
    .anull { display:none;}
	.SurveyPortletForm { }
    .SurveyPortletEligible { margin: 5px 10px; }
    .SurveyPortlet {
        text-align:left; font-size: 1em;
        margin: 10px; word-break:normal;
	}
	.SurveyPortletContinue { width: 300px; margin: 0 auto 20px auto;}
</style>
<%

    String status = (String) request.getAttribute("status");
    String fullPagePortletURL       = (String) request.getAttribute("fullPagePortletURL");
    String pollmsg                  = (String) request.getAttribute("pollmsg");
    String pollembedorlink_is_link  = (String) request.getAttribute("pollembedorlink_is_link");

    String viewresultslink          = (String) request.getAttribute("viewresultslink");
    String showResultsLink          = (String) request.getAttribute("showResultsLink");
    String viewresultsmsg           = (String) request.getAttribute("viewresultsmsg");

    String iframe           		= (String) request.getAttribute("iframe");
    String iframesrc           		= (String) request.getAttribute("iframesrc");
	String formactionurl           	= (String) request.getAttribute("formactionurl");
	String pollid          		 	= (String) request.getAttribute("pollid");
	String allalphapollid          	= (String) request.getAttribute("allalphapollid");
	String formtag          		= (String) request.getAttribute("formtag");
    String continuelink        		= (String) request.getAttribute("continuelink");
    String viewresultsshow        	= (String) request.getAttribute("viewresultsshow");
    String viewresultsbody        	= (String) request.getAttribute("viewresultsbody");

    String showeligible        	    = (String) request.getAttribute("showeligible");
    String[] eligible  		        = (String[]) request.getAttribute("eligible");

    // divs with class anull disappear
%>
<div class="SurveyPortlet">
<div class="a<%=status%>">
    <!-- statusmessages -->
    <%=status%>
</div>
    <script>
	    ValidatorArray = []
	    ValidatorArrayProperties = []
    </script>
<div class="a<%=pollembedorlink_is_link%>">
    <a href="<%=fullPagePortletURL%>"><%=pollmsg%></a>
    <!-- take survey, customized -->
</div>

<div class="a<%=iframe%>" >

    <form<%=formtag%> class="SurveyPortletForm" method="post" action="<%=formactionurl%>" name='form<%=allalphapollid%>' id='form<%=allalphapollid%>'
        data-senna-off="true"
                      onSubmit ="return vwfOnSubmit(this,'form<%=allalphapollid%>')">
		<input type="hidden" name="submittedpollid" value="<%=pollid%>">
		<%=iframesrc%>
	</form<%=formtag%>>

</div>

<div class="a<%=viewresultslink%>">
    <a href="<%=showResultsLink%>"><%=viewresultsmsg%></a>
</div>

<div class="a<%=viewresultsshow%>">
    <%=viewresultsbody%>
</div>
<div class="a<%=showeligible%>">
    <%
        for ( String link : eligible ) {
    %>
    <div class="SurveyPortletEligible"><%=link%></div>
    <%
        }
    %>
</div>

<div class="SurveyPortletContinue"><%=continuelink%></div>

</div>
