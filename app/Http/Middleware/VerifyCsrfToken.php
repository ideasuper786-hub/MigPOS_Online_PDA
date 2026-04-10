<?php

class VerifyCsrfToken
{
    protected $except = [
        'admin/*',
    ];
}
