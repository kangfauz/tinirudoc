<?php


function img_resize( $originalFile, $targetFile, $newWidth) 
{

    $info = getimagesize($originalFile);
    $mime = $info['mime'];

    switch ($mime) {
            case 'image/jpeg':
                    $image_create_func = 'imagecreatefromjpeg';
                    $image_save_func = 'imagejpeg';
                    $new_image_ext = 'jpg';
                    break;

            case 'image/png':
                    $image_create_func = 'imagecreatefrompng';
                    $image_save_func = 'imagepng';
                    $new_image_ext = 'png';
                    break;

            case 'image/gif':
                    $image_create_func = 'imagecreatefromgif';
                    $image_save_func = 'imagegif';
                    $new_image_ext = 'gif';
                    break;

            default: 
                    throw new Exception('Unknown image type.');
    }

    $img = $image_create_func($originalFile);
    list($width, $height) = getimagesize($originalFile);

    $newHeight = ($height / $width) * $newWidth;
    $tmp = imagecreatetruecolor($newWidth, $newHeight);
    imagecopyresampled($tmp, $img, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

    if (file_exists($targetFile)) {
            unlink($targetFile);
    }
    //.$new_image_ext
    $image_save_func($tmp, "$targetFile");
}
function getMimeType($base64_string)
{
    $img = explode(',', $base64_string);
    $ini =substr($img[0], 11);
    $type = explode(';', $ini);
    return  $type[0]; // result png
}

function base64_to_jpeg($base64_string, $output_file) {
	if(!empty($base64_string)){
    // open the output file for writing
    $ifp = fopen( $output_file, 'wb' ); 

    // split the string on commas
    // $data[ 0 ] == "data:image/png;base64"
    // $data[ 1 ] == <actual base64 string>
    $data = explode( ',', $base64_string );

    // we could add validation here with ensuring count( $data ) > 1
    fwrite( $ifp, base64_decode( $data[ 1 ] ) );

    // clean up the file resource
    fclose( $ifp ); 

    return $output_file;
	}
}


function clearTag($string, $striptags=false)
{
    if($striptags) $string = strip_tags($string);

    return htmlentities($string, ENT_QUOTES, "UTF-8");
}
function removeDir($dir) {
    if (is_dir($dir)) {
      $objects = scandir($dir);
      foreach ($objects as $object) {
        if ($object != "." && $object != "..") {
          if (filetype($dir."/".$object) == "dir") 
          removeDir($dir."/".$object); 
          else unlink   ($dir."/".$object);
        }
      }
      reset($objects);
      rmdir($dir);
    }
}

/* 
* This function copy $source directory and all files 
* and sub directories to $destination folder
*/

function recursive_copy($src,$dst) {
	$dir = opendir($src);
	@mkdir($dst, 0775);
	while(( $file = readdir($dir)) ) {
		if (( $file != '.' ) && ( $file != '..' )) {
			if ( is_dir($src . '/' . $file) ) {
				recursive_copy($src .'/'. $file, $dst .'/'. $file);
			}
			else {
				copy($src .'/'. $file,$dst .'/'. $file);
			}
		}
	}
	closedir($dir);
}

function makeTempFileJson($pathApp, $name, $data)
{
    $fp = fopen($pathApp.'/_'.$name.'.json', 'w');
    fwrite($fp, json_encode($data));
    fclose($fp);
}