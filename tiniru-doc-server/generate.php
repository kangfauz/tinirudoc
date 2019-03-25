<?php

/*
 * Tiniru Doc
 * Version 0.1, 2019
 * 
 * @website - https://tiniru.com
 * 
 */

ini_set('display_errors', -1);
ini_set('display_startup_errors', -1);
error_reporting(E_ALL);
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
$content = trim(file_get_contents("php://input"));

$content = json_decode($content, true);

$path           = './temp/';
$skeletonPath   = './skeleton/';
$resultPath     = './export/';
$base_template  = $skeletonPath."template/basic/";

require_once(__DIR__.'/lib/vendor/autoload.php');
use Spipu\Html2Pdf\Html2Pdf;

require_once(__DIR__.'/lib/TemplateRender.php');
require_once(__DIR__.'/lib/Helpers.php');

/*
*Main prosess
*/

if(empty($content['datatype']) || empty($content['project'])  )
{
    echo json_encode(array("message"=>"Breakdown"));
}else
{
    $datatype   = clearTag($content['datatype'],true);
    $project    = clearTag($content['project'],true);
    $projectDir    = preg_replace("/[^a-zA-Z0-9]+/", "",$project);
    

    $pathApp = $path.$projectDir;

    

    if($datatype=='project' && !empty($content['app']))
    {

        removeDir($pathApp);
        @mkdir($pathApp, 0775);
        @mkdir($pathApp.'/html', 0775);
        
        /*
        * copy assets file html 
        */
        recursive_copy($base_template."assets/","$pathApp/html/assets/");

        $fp = fopen($pathApp.'/_temp.txt', 'w');
        fwrite($fp, date("Ymdhis"));
        fclose($fp);
        
        makeTempFileJson($pathApp, 'app', $content['app']);

    }elseif ($datatype=='topics' && !empty($content['topics']))
    {  
       
        makeTempFileJson($pathApp, 'topics', $content['topics']);
    }
    elseif ($datatype=='changelog' && !empty($content['changelog']))
    {
        makeTempFileJson($pathApp, 'changelog', $content['changelog']);
        
    }elseif ($datatype=='navigation' && !empty($content['navigation']))
    {
        makeTempFileJson($pathApp, 'navigation', $content['navigation']);

        
    }
    elseif ($datatype=='pages' && !empty($content['pages']))
    {
        #makeTempFileJson($pathApp, 'pages', $content['pages']);
        $file = $pathApp.'/_pages.txt';
        $data = json_encode($content['pages']);

        $fp = fopen($file, 'a+');
        fwrite($fp, $data."[!separator!]");
        fclose($fp);
        


    }elseif ($datatype=='generate' && !empty($content['generate']))
    {
        $pdfContent = "";

        /*
         *make image logo
         */
        $_app = json_decode(file_get_contents($pathApp.'/_app.json'),1);
        $mime = getMimeType($_app['logo']);
        $pathLogo = $pathApp.'/html/assets/image.'.$mime;
        base64_to_jpeg($_app['logo'], $pathLogo );
        img_resize($pathApp.'/html/assets/image.'.$mime, $pathApp.'/html/assets/logo.'.$mime, 120);
        img_resize($pathApp.'/html/assets/image.'.$mime, $pathApp.'/html/assets/favicon.'.$mime, 48);
        
        /*
         * cover pdf page
         */
        $cover = '<page>
            <style>p{line-height:1.5; font-size:16px;}</style>
            <div style="text-align:center; font-size:18px; margin-top:200px;">
                <img src="'.$pathApp.'/html/assets/logo.'.$mime.'" />
                <h1>'.$_app['name'].'</h1>
                '.$_app['description'].'              
            </div>
        </page>';
        $pdfContent .= $cover;

        /*
         * footer pdf page
         */

        $pdfFooter = '<page_footer style="text-align:right;"><span style="color:#999; font-size:12px;">Documentation of '.$_app['name'].', generate use Tiniru Doc.</span></page_footer>';

        /*
         *make header  navigation
         */
        $_nav = "";
        if(file_exists($pathApp.'/_navigation.json'))
        {
            $_navigation = json_decode(file_get_contents($pathApp.'/_navigation.json'),1);
            if(count($_navigation)>0)
            {
                $_nav = '<ul class="navbar-nav ml-auto">';
                foreach($_navigation as $val)
                {
                    $_nav .= '<li class="nav-item"><a class="nav-link" href="'.$val['url'].'">'.$val['label'].'</a></li>';
                }

                $_nav .= '</ul>';
            }
        }
        
        
        
        /*
         *make menu page
         */
        $_topics = json_decode(file_get_contents($pathApp.'/_topics.json'),1);
        $_pagetemp = explode("[!separator!]",file_get_contents($pathApp.'/_pages.txt'), -1);
        $fp = fopen($pathApp.'/_pages.json', 'w');
        fwrite($fp, json_encode($_pagetemp));
        fclose($fp);
        @unlink($pathApp.'/_pages.txt');
        $_pages = json_decode(file_get_contents($pathApp.'/_pages.json'),1);


        $_pageTopic = array();
        foreach($_pages as $val)
        {
            $val = json_decode($val, 1);
            
            if(!isset($_pageTopic[$val['topic']])) $_pageTopic[$val['topic']] = array();
            $_pageTopic[$val['topic']][] = array(
                "slug"  => $val['slug'],
                "title" => $val['title'],
                "order"  => $val['order'],
                "content" => $val['content'],
            );  
        }

        $_sidebar = "";
        $_sidebarPdf = "";
        $indexFile = "";
        $pagePdfContent = "";
        if(count($_topics)>0)
        {
            usort($_topics, function($a, $b) {
                return $a['order'] - $b['order'];
            });
            $t = 0;
            $y = 'A';
            foreach($_topics as $val)
            {
                $pagePdfContentInner = '';
                if(count($_pageTopic[$val['slug']]) > 0)
                {
                    $pageByTopic = $_pageTopic[$val['slug']];
                    usort($pageByTopic, function($a, $b) {
                        return $a['order'] - $b['order'];
                    });
                    $pageMenu = '<ul class="nav flex-column py-2">';
                    $pageMenuPdf = '<ol >';
                    $defaultForTopic = "#";
                    $n = 0;
                    foreach($pageByTopic as $v)
                    {
                        $urlFile = $v['slug'].'.html';
                        if($t==0)
                        {
                            $indexFile  = $v['slug'];
                            $urlFile    = 'index.html';

                        } 
                        $pageMenu .= '<li class="nav-item"><a class="nav-link " href="'.$urlFile.'">'.$v['title'].'</a></li>';


                        $pagePdfContentInner .= '<h2>'.$y.''.($t+1).'. '.$v['title'].'</h2>';
                        $pagePdfContentInner .= $v['content'];
                        $pageMenuPdf .= '<li style="font-size:16px; padding-bottom:10px; display:block;" >'.$v['title'].'</li>';

                        if($n>0) $defaultForTopic = $v['slug'].'.html';
                        $n++;

                        $t++;
                    }
                    $pageMenu .= '</ul>';
                    $pageMenuPdf .= '</ol>';
                }
                $_sidebar.= '<div class="py-1"><a class="topics font-weight-bold" href="'.$defaultForTopic.'">'.$val['name'].'</a>'.$pageMenu.'</div>';
                
                $_sidebarPdf .= '<p style="font-weight:bold; font-size:18px;" >'.$y.'. '.$val['name'].'</p>';
                $_sidebarPdf .= $pageMenuPdf;

                $pagePdfContent .= '<page>';
                $pagePdfContent .= '<h1 style="text-align:center;">'.$y.'. '.$val['name'].'</h1>';
                $pagePdfContent .= $pagePdfContentInner;
                $pagePdfContent .= $pdfFooter.'</page>';

                $y++;
            }

           
        }
        

        /*
         *make changelog page
         */
        $_changelog = json_decode(file_get_contents($pathApp.'/_changelog.json'),1);
        
        $_logmenu   = "";
        $_logmenuPdf   = "";
        $logPdfContent = "";
        if(count($_changelog)>0)
        {
            $_logmenu = '<div class="py-1"><a class="topics font-weight-bold" href="changelog.html">Change Log</a></div>';
            $_logmenuPdf = '<p style="font-weight:bold; font-size:18px;  margin-bottom:0px; line-height:1;" >Change Log</p>';
            usort($_changelog, function($a, $b) {
                return $a['order'] - $b['order'];
            });
            $contentLog = '<h1>Change Log</h1>';
            $logPdfContent .= '<page>';
            $logPdfContent .= '<h1 style="text-align:center;">Change Log</h1>';
            $a = 1;
            foreach($_changelog as $val)
            {
              
                $contentLog .= '<h2>'.$val['title'].'</h2>';
                $contentLog .= $val['content'];

                $logPdfContent .= '<h2>'.$a.'. '.$val['title'].'</h2>';
                $logPdfContent .= $val['content'];

                $a++;
            }
            
            

            $template =  new TemplateRender($base_template.'template.html', true);
            $template->set("name",$_app['name']);
            $template->set("navbar",$_nav);
            $template->set("changelog",$_logmenu);
            $template->set("topics",$_sidebar);
            $template->set("content",$contentLog);
            $template= $template->get();
            
            $fp = fopen($pathApp.'/html/changelog.html', 'w');
            fwrite($fp, $template);
            fclose($fp);
            
            $logPdfContent .= $pdfFooter.'</page>';
        }
        
        /*
         * create file htm by pages
         */
        foreach($_pages as $val)
        {
            $val = json_decode($val, 1);
            
            /*
             *set template
             */
            $template =  new TemplateRender($base_template.'template.html', true);
            $template->set("name",$_app['name']);
            $template->set("navbar",$_nav);
            $template->set("changelog",$_logmenu);
            $template->set("topics",$_sidebar);
            $template->set("content",$val['content']);
            $template= $template->get();
            
            $urlFile = $val['slug'].'.html';
            if($indexFile==$val['slug'])
            {
                $urlFile    = 'index.html';
            } 
            $fp = fopen($pathApp.'/html/'.$urlFile, 'w');
            fwrite($fp, $template);
            fclose($fp);
        }


        /*
         * export to zip
         */
        
        $filename = $project.'_html_'.date('mdyHis');
        //$path = realpath(__DIR__."/$pathApp/html");
        $path = realpath(__DIR__."/$pathApp");
        //$dir = $pathApp.'/'.$filename.'/';
        $pathFile = $resultPath.$filename;
        $zip = new ZipArchive();
        
        $zip->open($pathFile . '.zip', ZipArchive::CREATE | ZipArchive::OVERWRITE);
        $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path));
        foreach ($files as $name => $file)
        {
            if ($file->isDir()) {
                flush();
                continue;
            }
            
            $filePath = $file->getRealPath();
            $relativePath = substr($filePath, strlen($path) + 1);
            
            $zip->addFile($filePath, $relativePath);
        }
        $zip->close();
        
        /*
         * make pdf file
         */
        
        $pdfContent .= '<page>';
        $pdfContent .= '<h2 style="text-align:center;">Content</h2>';
        $pdfContent .=  $_logmenuPdf.$_sidebarPdf;
        $pdfContent .= $pdfFooter.'</page>';
        
        $pdfContent .= $logPdfContent.$pagePdfContent;

        $html2pdf = new Html2Pdf();
        $html2pdf->writeHTML($pdfContent);
        $html2pdf->output(__DIR__."/".$pathFile.'.pdf', 'F');

        echo json_encode(array("result"=>"finish","download"=>$filename));
        exit;
      
    }else{
        echo json_encode(array("result"=>"stop"));
        exit;
    }


    echo json_encode(array("result"=>"next"));
}

//secho json_encode($content);
