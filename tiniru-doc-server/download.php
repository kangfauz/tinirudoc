<?php

/*
 * Tiniru Doc
 * Version 0.1, 2019
 * 
 * @website - https://tiniru.com
 * 
 */

require_once(__DIR__.'/lib/Helpers.php');

$path           = './temp/';
$resultPath     = './export/';

if(empty($_GET['doc']) || empty($_GET['type'])) exit;
$filename=clearTag($_GET['doc']);
if(trim($_GET['type'])=='pdf')
{

    $filename=$resultPath.$filename.'.pdf';
    //if(!file_exists(filename)) exit;
    header('Content-Type: application/pdf');
    header("Content-Disposition: attachment; filename='$filename'");
    header('Content-Length: ' . filesize($zipname));
    header("Location: $filename");
    
}else
{
    $filename=$resultPath.$filename.'.zip';
    //if(!file_exists(filename)) exit;
    header('Content-Type: application/zip');
    header("Content-Disposition: attachment; filename='$filename'");
    header('Content-Length: ' . filesize($zipname));
    header("Location: $filename");
}