<?php

// 00020101021126570011ID.DANA.WWW011893600915302259148102090225914810303UMI51440014ID.CO.QRIS.WWW0215ID10200176114730303UMI5204581253033605802ID5922Warung Sayur Bu Sugeng6010Kab. Demak610559567630458C7

echo "[+] QRIS Statis to Dinamis Converter - By: GidhanB.A\n";
echo "[+] Input Data QRIS: ";
$qris = trim(fgets(STDIN));
echo "[+] Input Nominal: ";
$qty = trim(fgets(STDIN));
echo "[+] Biaya Layanan? (y/n): ";
$yn = trim(fgets(STDIN));

if ($yn == 'y') {
    echo "[+] Rupiah atau Persen? (r/p): ";
    $fee = trim(fgets(STDIN));
    if ($fee == 'r') {
        echo "[+] Input Biaya Layanan Dalam Rupiah: ";
        $tax = trim(fgets(STDIN));
        $tax = "55020256".sprintf("%02d", strlen($tax)).$tax;
    } elseif ($fee == 'p') {
        echo "[+] Input Biaya Layanan Dalam Persen: ";
        $tax = trim(fgets(STDIN));
        $tax = "55020357".sprintf("%02d", strlen($tax)).$tax;
    } else {
        die("Hadeh luh");
    }
}

$qris = substr($qris, 0, -4);
$step1 = str_replace("010211", "010212", $qris);
$step2 = explode("5802ID", $step1);
$uang = "54".sprintf("%02d", strlen($qty)).$qty;

if (empty($tax)) {
    $uang .= "5802ID";
} else {
    $uang .= $tax."5802ID";
}

$fix = trim($step2[0]).$uang.trim($step2[1]);
$fix .= ConvertCRC16($fix);

echo "\n[+] Result: $fix\n";

function ConvertCRC16($str) {
    function charCodeAt($str, $i) {
        return ord(substr($str, $i, 1));
    }
    $crc = 0xFFFF;
    $strlen = strlen($str);
    for($c = 0; $c < $strlen; $c++) {
        $crc ^= charCodeAt($str, $c) << 8;
        for($i = 0; $i < 8; $i++) {
            if($crc & 0x8000) {
                $crc = ($crc << 1) ^ 0x1021;
            } else {
                $crc = $crc << 1;
            }
        }
    }
    $hex = $crc & 0xFFFF;
    $hex = strtoupper(dechex($hex));
    if (strlen($hex) == 3) $hex = "0".$hex;
    return $hex;
}
