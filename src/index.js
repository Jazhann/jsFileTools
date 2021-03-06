var fs = require( 'fs' );
var mkdirp = require( 'mkdirp' );


var JsFileTools = function () {};

/**
 * Read a file 
 * @param {*} src file source
 */
JsFileTools.prototype.readFile = function ( src )  {
    return new Promise( function ( resolve, reject ) {
        fs.readFile( src, 'utf8', function ( error, data ) {
            if ( error )
                reject( error );
            else
                resolve( data );
        });
    });
}

/**
 * Write a file
 * @param {*} src file source
 * @param {*} data data to write
 */
JsFileTools.prototype.writeFile = function ( src, data ) {
    return new Promise( function( resolve, reject ) {
      fs.writeFile( src, data, 'utf8', function( error ) {
        if ( error )
          reject( error );
        else
          resolve( { result: 'ok' } );
      });
    });
}


/**
 * Search and modify a string from a file with a different string
 * @param {*} src file source
 * @param {*} stringsToReplace array with strings to replace format [["string to replace","replacing string" ]]
 */
JsFileTools.prototype.modifyFile = async function ( src, stringsToReplace ) {
    if ( !Array.isArray( stringsToReplace ) && stringsToReplace.length < 1) {
        var message = 'Second argument must be an array and not being empty';
        console.error( message );
        throw new Error( message );
    } 
    if (fs.existsSync( src )) {
        console.info( 'Modifying ' + src );
        var data = await JsFileTools.prototype.readFile( src );
        data = data.toString();
        stringsToReplace.forEach( element => {
            var reg = new RegExp( element[0], "gm" );
            data = data.replace( reg, element[1] );            
        })
        await JsFileTools.prototype.writeFile( src, data );
    } else {
        var message = src + ' not found. Skipping';
        console.error( message );
        throw new Error( message )
    }
}

/**
 * Copy a file 
 * @param {*} src source file 
 * @param {*} target target file
 */
JsFileTools.prototype.copyFile = function ( src, target, createParentDir = true ) {
    return new Promise( function( resolve, reject ) {
        if (fs.existsSync( src )) {
            var getDirName = require( 'path' ).dirname;
            var destDir = getDirName( target );
            if (!fs.existsSync( destDir )) {
                if (!createParentDir) {
                    var message = 'Skipping copying file ' + src + ' to ' + target;
                    console.info( message );
                    reject( message );
                }
                console.info( 'Creating directory ' + destDir );
                mkdirp.sync( destDir );
            }
            console.info( 'Copying ' + src + ' to ' + target );
            fs.createReadStream( src ).pipe( fs.createWriteStream( target ) );
            resolve( { result: 'ok' } );
        } else {
            var message = src + ' not found. Skipping';
            console.error( message );
            reject( message );
        }
    })
}

/**
 * Copy multiples files form a directory to another one
 * @param {*} src source directory
 * @param {*} target target directory
 */
JsFileTools.prototype.copyDir = function ( src, target, recursive = true ) {
    return new Promise( function( resolve, reject ) {
        if ( fs.existsSync( src ) && fs.existsSync( target ) ) {
            var files = fs.readdirSync( src );
            files.forEach( function ( file ) {
                var fileSrc = src + '/' + file;
                var fileDest = target + '/' + file ;
                if ( fs.lstatSync( fileSrc ).isDirectory() && recursive ) {
                if ( !fs.existsSync( fileDest )) {
                    console.info( 'Creating directory ' + fileDest );
                    fs.mkdirSync( fileDest );
                }
                JsFileTools.prototype.copyDir( fileSrc, fileDest );
                } else {               
                    console.info( 'Copying ' + fileSrc + ' to ' + fileDest );
                    fs.createReadStream( fileSrc ).pipe( fs.createWriteStream( fileDest ) );
                }
            } );
            resolve( { result: 'ok' } );
        } else {
            var message = src + ' not found. Skipping';
            console.error( message );
            reject( message );
        }
    })
}

/**
 * Delete a file
 * @param {*} src source file
 * @returns 
 */
JsFileTools.prototype.deleteFile = function ( src ) {
    return new Promise( function( resolve, reject ) {
        if (fs.lstatSync( src ).isDirectory()) {
            var message = 'Directories can not be deleted use deleteDir';
            console.error( message );
            reject( message )
        } else {
            try {
                fs.unlinkSync(src);
                console.info("File deleted:", src);
                resolve( { result: 'ok' } );
            } catch ( error ) {
                var message = 'Error while deleting ' + src + ', ' + error;
                console.error( message) ;
                reject( error )
            }
        }
    })
}

/**
 * Delete a directory and all inside it
 * @param {*} src source directory
 */
JsFileTools.prototype.deleteDir = function ( src ) {
    return new Promise( function( resolve, reject ) {
        if (fs.lstatSync( src ).isDirectory()) {
            try {
                fs.rmdirSync(src, { recursive: true });
                console.info('Directory deleted: ' + src);
                resolve( { result: 'ok' } );
            } catch (error) {
                var message = 'Error while deleting ' + src + ', ' + error;
                console.error( message );
                reject( message )
            }
        } else {
            var message = src + ' is not a directory';
            console.error( message );
            reject( message )
        }
    })

}


module.exports = new JsFileTools();