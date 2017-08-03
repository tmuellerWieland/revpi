var ffi = require('ffi');
var ref = require('ref');
var struct = require('ref-struct');
var ArrayType = require('ref-array');

var uint8 = ref.types.uint8;
var uint8Array = ArrayType(uint8); 
var uint8ArrayPtr = ref.refType(uint8Array);

var SDeviceInfo = struct({
    'i8uAddress': 'uint8',
    'i32uSerialnumber': 'uint32',
    'i16uModuleType': 'uint16',
    'i16uHW_Revision': 'uint16',
    'i16uSW_Major': 'uint16',
    'i16uSW_Minor': 'uint16',
    'i32uSVN_Revision': 'uint32',
    'i16uInputLength': 'uint16',
    'i16uOutputLength': 'uint16',
    'i16uConfigLength': 'uint16',
    'i16uBaseOffset': 'uint16',
    'i16uInputOffset': 'uint16',
    'i16uOutputOffset': 'uint16',
    'i16uConfigOffset': 'uint16',
    'i16uConfigOffset': 'uint16',
    'i16uFirstEntry': 'uint16',
    'i16uEntries': 'uint16',
    'i8uModuleState': 'uint8',
    'i8uModuleState': 'uint8',
    'i8uReserve': ref.types.uint8
});
var SDeviceInfoPtr = ref.refType(SDeviceInfo);

var SEntryInfo = struct({
    'i8uAddress': 'uint8',
    'i8uType': 'uint8',
    'i16uIndex': 'uint16',
    'i16uBitLength': 'uint16',
    'i8uBitPos': 'uint8',
    'i16uOffset': 'uint16',
    'i32uDefault': 'uint32',
    'strVarName': ref.types.char 
});
var SEntryInfoPtr = ref.refType(SEntryInfo);

var SPIValue = struct({
    'i16uAddress': 'uint16',
    'i8uBit': 'uint8',
    'i8uValue': 'uint8'
});
var SPIValuePtr = ref.refType(SPIValue);

var SPIVariable = struct({
    'strVarName': ref.types.char,
    'i16uAddress': 'uint16',
    'i8uBit': 'uint8',
    'i16uLength': 'uint16'
});
var SPIVariablePtr = ref.refType(SPIVariable);

var SDIOResetCounter = struct({
    'i8uAddress': 'uint8',
    'i16uBitfield': 'uint16'
}); 
var SDIOResetCounterPtr = ref.refType(SDIOResetCounter);

var lib = ffi.Library('./lib/libRevolutionPi', {  
    'piControlGetBitValue': [ 'int', [ SPIValuePtr ] ],
    'piControlRead': [ 'int', [ 'uint32', 'uint32', uint8ArrayPtr ] ],
    'piControlSetBitValue': [ 'int', [ SPIValuePtr ] ],
    'piControlWrite': [ 'int', [ 'uint32', 'uint32', uint8ArrayPtr ] ],
    'piControlClose': [ 'void', [] ]
});

function arrayConvert(Uint8Arr) {
    var length = Uint8Arr.length;

    let buffer = Buffer.from(Uint8Arr);
    var result = buffer.readUIntBE(0, length);

    return result;
}

function piControlGetBitValue(address, bit) {
    var sValue = new SPIValue();
    sValue.i16uAddress = 11;
    sValue.i8uBit = 0;

    lib.piControlGetBitValue(sValue.ref());
    return sValue.i8uValue;
}

function piControlRead(offset, length) {
    var pValues = new uint8Array(length);

    lib.piControlRead(offset, length, pValues.ref());
    return arrayConvert(pValues);
}

function piControlSetBitValue(offset, bit, value) {
    
    if (bit < 0 || bit > 7) {
        return;
    }

    if (value != 0 && value != 1) {
        return;
    }

    var sValue = new SPIValue();
    sValue.i16uAddress = 11;
    sValue.i8uBit = 0;
    sValue.i8Value = value;

    lib.piControlSetBitValue(sValue.ref());
}

function piControlWrite(offset, length, value) {

    if (length == 1) {
        var pData = new uint8Array(value)
    } else if (length == 2) {
        var pData = new uint8Array(value, value>>8);
    } else if (length == 4) {
        var pData = new uint8Array(value, value>>8, value>>16, value>>24);
    } else {
        return;
    }

    lib.piControlWrite(offset, length, pData.ref());
}

exports.getBitValue = function(address, bit) {
    var result = piControlGetBitValue(address, bit);
    piControlClose();
    return result; 
}

exports.read = function(offset, length) {
    var result = piControlRead(offset, length);
    piControlClose();
    return result; 
}

exports.setBitValue = function(offset, bit, value) {
    piControlSetBitValue(offset, bit, value);
    piControlClose();
}

exports.write = function(offset, length, value) {
    piControlWrite(offset, length, value);
    piControlClose();
}
