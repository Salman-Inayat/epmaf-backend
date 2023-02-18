#############################
##  Environment Variables  ##
#############################
$environment = "Identity Domain Name"

$epmBatchPath = "C:\PSCAF_Master\EPMAF_V3.0"

$delimiter = "|"

$archiveRetain = "30"

$epmautomatePath = "C:\Oracle\EPM Automate\bin\epmautomate.bat"

$enableSQLLogging = "False"


########################
##   Time Variables   ##
########################
$EPMFileDateTime = $(get-date -f yyyy_MM_dd_HH_mm_ss)
$EPMFileDate = $(get-date -f yyyy_MM_dd)

$FCCCurrPeriod = "Jun"
$FCCCurrYear = "FY20"
$FCCCurrPeriodYear = "Jun-FY20"

#############################
##          Paths          ##
#############################
$envPath = $epmBatchPath + "\Environment"
$logPath = $epmBatchPath + "\Log" + "\" + $processName
$errorPath = $epmBatchPath + "\Error" + "\" + $processName
$scriptRootPath = $epmBatchPath + "\Script"
$scriptPath = $scriptRootPath + "\" + $processName
$archivePath = $epmBatchPath + "\Archive" + "\" + $processName
$credentialPath = $epmBatchPath + "\Credential\Encrypted_Passwords"
$triggerPath = $epmBatchPath + "\Inbox\Trigger"
$tempPath = $epmBatchPath + "\Temp"
$inboxPath = $epmBatchPath + "\Inbox"
$outboxPath = $epmBatchPath + "\Outbox"

#############################
##       SFTP Server       ##
#############################
$global:sftpSourceFilePath = $epmBatchPath + "\Outbox\ToSFTP"

$global:sftpUploadFiles = @()

$sftpUser = "efMIKDT7"
$sftpPasswordFile = $credentialPath + "\sftppassword.txt"
$sftpPassword = Get-Content $sftpPasswordFile | ConvertTo-SecureString
$sftpCreds = New-Object System.Management.Automation.PSCredential ($sftpUser, $sftpPassword)
$sftpServer = "sftp.us2.cloud.oracle.com"
$sftpTarget = "/upload/"

##############################
##        SQL Server        ##
##############################
$global:genSQLFile1 = "SQLTable1_" + $processName + $(get-date -f _yyyy_MM_dd_HH_mm_ss) + ".csv"
$global:genSQLFile2 = "SQLView1_" + $processName + $(get-date -f _yyyy_MM_dd_HH_mm_ss) + ".csv"

$ConnectionToUse = "MSSQL" #MSSQL, Oracle, or MySQL

#MSSQL
If($ConnectionToUse -eq "MSSQL"){
    $logSQLServer = "127.0.0.1"
    $logSQLServerDatabase = "DRM_STAGING"
    $logSQLServerUser = "SA"
    $logSQLServerPasswordFile = $($credentialPath + "\sqlserverpassword.txt")
    $logSQLServerPassword = Get-Content $logSQLServerPasswordFile | ConvertTo-SecureString
    $logSQLServerPassword.MakeReadOnly()
    $logSQLServerCredential = New-Object System.Data.SqlClient.SqlCredential ($logSQLServerUser, $logSQLServerPassword)
}

#Oracle
If($ConnectionToUse -eq "Oracle"){

    $SecurePassword = Get-Content $($credentialPath + "\sqlserverpassword.txt") | ConvertTo-SecureString
    $UnsecurePassword = (New-Object PSCredential "user",$SecurePassword).GetNetworkCredential().Password

    $logSQLServer = "127.0.0.1"
    $logSQLServerDatabase = "DB_NAME"
    $logSQLServerUser = "USER_NAME"
    $logSQLServerPasswordFile = $($credentialPath + "\sqlserverpassword.txt")
    $logSQLServerPassword = Get-Content $logSQLServerPasswordFile | ConvertTo-SecureString
    $logSQLServerPassword.MakeReadOnly()
    $logSQLServerPassword | ConvertTo-SecureString -AsPlainText -Force
}

#MySQL
If($ConnectionToUse -eq "MySQL"){

    $SecurePassword = Get-Content $($credentialPath + "\sqlserverpassword.txt") | ConvertTo-SecureString
    $UnsecurePassword = (New-Object PSCredential "user",$SecurePassword).GetNetworkCredential().Password

    $logSQLServer = "127.0.0.1"
    $logSQLServerDatabase = "DB_NAME"
    $logSQLServerUser = "USER_NAME"
    $logSQLServerPasswordFile = $credentialPath + "\sqlserverpassword.txt"
    $logSQLServerPassword = Get-Content $logSQLServerPasswordFile | ConvertTo-SecureString
    $logSQLServerPassword.MakeReadOnly()
    $logSQLServerPassword | ConvertTo-SecureString -AsPlainText -Force
    [Reflection.Assembly]::LoadFile("C:\Program Files (x86)\MySQL\Connector NET 8.0\Assemblies\v4.5.2\MySql.Data.dll")
    [Reflection.Assembly]::LoadWithPartialName("MySql.Data")
}

#############################
##        EPM Cloud        ##
#############################
$EPMCloudEnvironment = @()

#EPM Cloud Environment 0
#Oracle EDM Demo Pod
$EPMCloudEnvironmentAdd = "" | select EPMdomain, EPMurl, EPMuser, EPMpass, EPMStartPeriod, EPMEndPeriod
$EPMCloudEnvironmentAdd.EPMdomain = "edm"
$EPMCloudEnvironmentAdd.EPMurl = 'https://epm-189389-edm.hap.fra.demoservices003.oraclepdemos.com/epmcloud'
$EPMCloudEnvironmentAdd.EPMuser = 'epm_default_cloud_admin'
$EPMCloudEnvironmentAdd.EPMpass = $credentialPath + "\EDM.epw"
$EPMCloudEnvironment += $EPMCloudEnvironmentAdd

#############################
##         Essbase         ##
#############################
#Essbase Environment 0
#Local Essbase Environment
$MaxLPath = "C:\Oracle\Middleware\user_projects\epmsystem1\EssbaseServer\essbaseserver1\bin\startMaxL.bat"
$MaxLKey = "157408061,195511471"
$EssbaseServer = "WIN-8RA4SQ1A7FG"
$EssbaseUser = '$key 506573771422126950727289001'
$EssbasePassword = '$key 502609441524560551325856451328602620340346410146749840303634531'
$appPath = "\\WIN-8RA4SQ1A7FG\essbaseserver1\app"
$EssbaseApp1 = "Sample"
$EssbaseDB1 = "Basic"
$EssbaseAppDB1 = "Sample.Basic"
$EssbaseSQLUser = '$key 805888710950042901'
$EssbaseSQLPassword = '$key 978753020361187341549268070463592900405638720925452470692671711726993930'

#####################################
##  E-mail Notification Variables  ##
#####################################
$emailFrom = "No-Reply@Domain"
$emailTo = @("No-Reply@Domain")
$emailSMTPServer = "smtp.domain.com"
#$emailSMTPPort = "587"
#$emailSMTPPort = "465"
$emailSMTPPort = "25"
#$emailPasswordFile = $credentialPath + "\smtppassword.txt"
#$emailPassword = Get-Content $emailPasswordFile | ConvertTo-SecureString
#$emailCredential = New-Object System.Management.Automation.PSCredential ($emailFrom, $emailPassword)
$emailAuth = "False"
