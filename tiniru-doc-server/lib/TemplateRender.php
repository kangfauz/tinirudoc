<?php
class TemplateRender {

    private $message;

    public function __construct($file = "", $is_file = false) {
        if($is_file)
            $this->message = file_get_contents($file);
        else $this->message = $file;
    }
    public function set($key, $value) {
        $this->message = str_replace('{{' . $key . '}}', $value, $this->message);
    }
    public function get() {
        return $this->message;
    }

    

}