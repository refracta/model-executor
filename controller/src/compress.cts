import tar from "tar";

!async function () {
    await tar.c(
        {
            gzip: true,
            file: 'controller.tar'
        },
        ['controller-linux']
    );
}();