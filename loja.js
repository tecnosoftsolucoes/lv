$(function() {
    $.ajaxSetup({
        headers: {
            "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
        },
    });

    if (!window.matchMedia("(min-width: 760px)").matches) {
        $('#navbarDepartamentos').removeClass('btn-group').addClass('btn-group-vertical');
    }

    const replaceSpecialChars = (str) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/([^\w]+|\s+)/g, '-') // Substitui espaço e outros caracteres por hífen
            .replace(/\-\-+/g, '-') // Substitui multiplos hífens por um único hífen
            .replace(/(^-+|-+$)/, ''); // Remove hífens extras do final ou do inicio da string
    }

    function montaItem(cfg, item) {
        html = "";
        if (cfg.GUEST == 1) {
            html += '<a class="float-right text-danger btn btn-lg btn-link mdi mdi-heart-outline" href="/login"></a>';
        } else {
            if (item.DESEJO == 0) {
                html += '<button class="float-right text-danger btn btn-lg btn-link listadesejos mdi mdi-heart-outline" value="' + item.ID_PROD + '"></button>';
            } else {
                html += '<button class="float-right text-danger btn btn-lg btn-link listadesejos mdi mdi-heart" value="' + item.ID_PROD + '"></button>';
            }
        }
        var descricao = replaceSpecialChars(item.DESCRICAO);
        html += '<a href="/produtos/detalhes/' + item.ID_PROD + '/' + descricao + '" class="card-link text-secondary">';
        if (item.ID_SELO != null) {
            html += '<div class="LoadSelo"><img class="selo position-absolute" src="" id="sel' + item.ID_SELO + '" style=""></div>';
        }
        if (item.IMAGENS > 0) {
            if (item.ST == "") {
                html += '<div class="LoadImage">';
                html += '<div class="d-flex justify-content-center spinner"><div class="spinner-border spinner-border-sm" role="status"><span class="sr-only">Carregando...</span></div></div>';
                html += '<img class="card-img-top" id="' + item.ID_IMG + '" src="">';
                html += '</div>';
            } else {
                html += '<img class="card-img-top" id="' + item.ID_IMG + '" src="' + item.ST + '" alt="' + item.DESCRICAO + '">';
            }
        } else {
            html += '<img class="card-img-top" id="" src="/img/notfound.jpg" alt="' + item.DESCRICAO + '">';
        }

        if (cfg.EXIBIR_COD_PROD == 1) {
            html += '<div class="codigo-prod text-center"> <span class="font-weight-bold my-1 small">' + item.CODIGO + '</span> </div>';
        }

        html += '<div class="descricao"><p class="text-center descricao" style="text-transform: capitalize"><small>' + item.DESCRICAO + '</small></p></div>';


        if(cfg.CATALOGO == 1){
            // - config. CATALOGO estas ativo não exibe preco.
        }else{

            if (cfg.EXIB_VALOR_APENAS_USUARIO === 1 && (cfg.GUEST == 1 || cfg.BLOQUEADO == 1)) {
                html += '<h6 class="text-center"><small>Valor disponível após Autenticação</small></h6>';
            }else {
                if (cfg.DEST_PROMO == 1) {
                    if (item.PROMOCAO != '' && item.PROMOCAO < item.PRECOVENDA) {
                        html += '<div class="preco-promocao TS_JS">'+
                            '<h6 class="text-center bg-dark text-white" style="margin-bottom: 0;">De: <span style="text-decoration: line-through;">R$' + item.PRECOVENDA + '</span></h6>'+
                            '<h3 class="text-center bg-warning text-dark"><small>Por:</small>R$ ' + item.PROMOCAO + '</span></h3></div>';
                    } else {
                        html += '<h6 class="text-center bg-transparent text-white my-1" style="margin-bottom: 0">.</h6>';
                        html += '<div class="text-center">' +
                            '<small><strong class="h6 align-center">R$ </strong></small><span class="h3">' + item.PRECOVENDA + '</span>' +
                            '</div>';
                    }
                } else {
                    html += '<h3 class="text-center">R$ ' + item.PRECOVENDA + '</h3>';
                }

                if (item.PLANO != '') {
                    html += '<h4 class="small text-center descricaoplano">' + item.PLANO + '</h4>';
                }
            }

        }

        html += '</a>';

        if(cfg.CATALOGO == 1){
            // - config. CATALOGO estas ativo não exibe preco.
            html += '<div class="row mx-3 mb-1 btComprarHabilitado">';
            html += '<button id="' + item.ID_PROD + '" class="col-xs-12 btn btn-block btn' + cfg.BUTTON_CLASS + cfg.PESQ_BUTTON_COMPRAR + ' comprar" value="' + item.UNID_VENDA + '">Adicionar <span id="icone' + item.ID_PROD + '" class="mdi mdi-' + cfg.CHECKOUT_ICON_CLASS_ADD + '"></span></Button>';
            html += '</div>';
        }else{

            if (item.KIT > 0) {
                html += '<a class="ts-detal-kit btn btn-block btn mdi mdi-information' + cfg.PESQ_BUTTON_ADICIONADO + ' " href="/produtos/detalhes/' + item.ID_PROD + '/' + descricao + '"> Detalhes</a>';
            } else {
                if (cfg.PROD_SEM_ESTOQUE == 1 && item.DISPONIVEL == 2 && cfg.EST_FAB_HABILITAR == 0 ||
                    cfg.PROD_SEM_ESTOQUE == 1 && item.DISPONIVEL == 2 && cfg.EST_FAB_HABILITAR == 1 && item.HAB_EST_FAB == 0) {
                    if (cfg.EST_EXIB > 1) {
                        html += '<div class="text-center"><label>sem estoque</label></div>';
                    }
                    var indisponivel = $("#htmlindisponivel").val();
                    html += indisponivel;
                } else {
                    if (cfg.EST_EXIB > 1) {
                        html += '<div class="text-center"><label>';
                        if (cfg.EST_FAB_HABILITAR == 1 && item.HAB_EST_FAB == 1) {
                            html += '<span class="text-danger"> </span>';
                        } else {
                            switch (cfg.EST_EXIB) {
                                case 2:
                                    {
                                        html += 'Estoque: ' + item.ESTOQUE;
                                        break;
                                    }
                                case 3:
                                    {
                                        if (item.ESTOQUE > item.MINIMO) {
                                            html += 'Estoque: ' + item.ESTOQUE;
                                        } else {
                                            html += '<span class="text-danger">Só resta' + (item.ESTOQUE >= 2 ? 'm ' : ' ') + item.ESTOQUE + ' unidade' + (item.ESTOQUE >= 2 ? 's' : '') + '</span>';
                                        }
                                        break;
                                    }
                                case 4:
                                    {
                                        if (item.ESTOQUE > (item.MINIMO * 0.75)) {
                                            html += 'Estoque: ' + item.ESTOQUE;
                                        } else {
                                            html += '<span class="text-danger">Só resta' + (item.ESTOQUE >= 2 ? 'm ' : ' ') + item.ESTOQUE + ' unidade' + (item.ESTOQUE >= 2 ? 's' : '') + '</span>';
                                        }
                                        break;
                                    }
                                case 5:
                                    {
                                        if (item.ESTOQUE > (item.MINIMO * 0.50)) {
                                            html += 'Estoque: ' + item.ESTOQUE;
                                        } else {
                                            html += '<span class="text-danger">Só resta' + (item.ESTOQUE >= 2 ? 'm ' : ' ') + item.ESTOQUE + ' unidade' + (item.ESTOQUE >= 2 ? 's' : '') + '</span>';
                                        }
                                        break;
                                    }
                            }
                        }
                        html += '</label></div>';
                    }
                    if (cfg.PESQ_EXIB_BOT_ENV_CESTA >= 1) {
                        html += '<div class="mt-1 divbtComprar mx-1 mx-md-2 mx-xl-3  ' + (cfg.OCULTAR_BT_COMPRAR == 1 ? 'invisible' : '') + '">';
                        if (cfg.EXIB_COMBO_QTDE == 1) {
                            html +=
                            '<div class="mx-md-3 mx-1 mr-0">'+
                            '    <div class="row mb-1 btn-group btn-group-sm btn-block" role="group" aria-label="Adicionar por quantidade">'+
                            '       <button id="ec' + item.ID_PROD + '" class="col-xs-12 btn btn' + cfg.BUTTON_CLASS + cfg.PESQ_BUTTON_COMPRAR + ' btn-sm enviarcesta" value="' + item.UNID_VENDA + '">Adicionar'+
                            '           <span id="icone' + item.ID_PROD + '" class="mdi mdi-' + cfg.CHECKOUT_ICON_CLASS_ADD + '"></span>'+
                            '       </Button>'+
                            '       <div class="btn-group dropup" role="group">'+
                            '           <button id="grpenviarcesta' + item.ID_PROD + '" type="button" class="btn btn-sm btn-block btn' + cfg.BUTTON_CLASS + cfg.PESQ_BUTTON_COMPRAR + ' grpenviarcesta dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>'+
                            '           <div class="dropdown-menu" aria-labelledby="Adicionar">';
                            for ($i = 0; $i < 6; $i++) {
                                if (cfg.PROD_SEM_ESTOQUE == 1 && item.EST < (($i + 1) * item.UNID_VENDA)) {
                                    break;
                                }
                                html += '<button class="dropdown-item itemenviarcesta" id="ec' + item.ID_PROD + '" value="' + (($i + 1) * item.UNID_VENDA) + '">' + (($i + 1) * item.UNID_VENDA) + '</button>';
                            }
                            html +=
                            '           </div>'+
                            '       </div>'+
                            '   </div>'+
                            '</div>';

                        } else {
                            html += '<div class=" btComprarHabilitado">'+
                            '   <button id="ec' + item.ID_PROD + '" class="btn btn-block btn' + cfg.BUTTON_CLASS + cfg.PESQ_BUTTON_COMPRAR + ' enviarcesta" value="' + item.UNID_VENDA + '">Adicionar'+
                            '       <span id="icone' + item.ID_PROD + '" class="mdi mdi-' + cfg.CHECKOUT_ICON_CLASS_ADD + '"></span>'+
                            '   </Button>'+
                            '</div>';
                        }
                        html += '</div>';
                    }

                    if (cfg.PESQ_EXIB_BOT_COMPRAR == 1) {
                        html += '<div class="divbtComprar mx-1 mx-md-2 mx-xl-3 ' + (cfg.OCULTAR_BT_COMPRAR == 1 ? 'invisible' : '') + '">';
                        if (cfg.PESQ_EXIB_BOT_ENV_CESTA == 0 && cfg.EXIB_COMBO_QTDE == 1) {
                            html +=
                            '<div class="mx-md-3 mx-1 mr-0">'+
                            '   <div class="row mb-1 btn-group btn-group-sm btn-block" role="group" aria-label="Adicionar por quantidade">'+
                            '       <button id="' + item.ID_PROD + '" class="col-xs-12 btn btn' + cfg.BUTTON_CLASS + cfg.PESQ_BUTTON_COMPRAR + ' btn-sm comprar" value="' + item.UNID_VENDA + '">Comprar' +
                            '           <span id="icone' + item.ID_PROD + '" class="mdi mdi-' + cfg.CHECKOUT_ICON_CLASS_ADD + '"></span>'+
                            '       </Button>'+
                            '       <div class="btn-group dropup" role="group">'+
                            '           <button id="grpComprar' + item.ID_PROD + '" class="btn btn-sm btn-block btn' + cfg.BUTTON_CLASS + cfg.PESQ_BUTTON_COMPRAR + ' grpComprar dropdown-toggle" '+
                            '               type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-display="static" >'+
                            '           </button>'+
                            '           <div class="dropdown-menu dropdown-menu-right p-0 ts-dropdown-menu" aria-labelledby="comprar">';
                            for ($i = 0; $i < 6; $i++) {
                                if (cfg.PROD_SEM_ESTOQUE == 1 && parseInt(item.EST) < parseInt((($i + 1) * item.UNID_VENDA))) {
                                    break;
                                }
                                html += '   <button class="dropdown-item itemcomprar text-right" id="' + item.ID_PROD + '" value="' + (($i + 1) * item.UNID_VENDA) + '">' + (($i + 1) * item.UNID_VENDA) + '</button>';
                            }
                            if (item.FRACIONAR == 1){
                                html +=
                                '          <div class="dropdown-divider"></div>'+
                                '             <div class="px-2">'+
                                '                 <label class="small p-6 m-0">Digite a quantidade:</label>'+
                                '                 <div class="input-group mb-3">'+
                                '                     <input type="number" class="form-control text-right" id="qtdfrac'+item.ID_PROD+'" name="qtdeFrac" '+
                                '                         min="1" max="'+item.ESTOQUE+'" value="'+(item.ESTOQUE < item.UNID_VENDA*1 ? item.ESTOQUE : item.UNID_VENDA*1)+'">'+
                                '                     <div class="input-group-append">'+
                                '                         <button type="button" class="btn btn-success confirmQtdFrac" value="'+item.ID_PROD+'">'+
                                '                             <i class="mdi mdi-chevron-right"></i>'+
                                '                         </Button>'+
                                '                     </div>'+
                                '                 </div>'+
                                '             </div>';
                            }

                            html +=
                            '           </div>'+
                            '       </div>'+
                            '   </div>'+
                            '</div>';

                        } else {
                            html += '<div class="btComprarHabilitado">';
                            html += '<button id="' + item.ID_PROD + '" class="btn btn-block btn' + cfg.BUTTON_CLASS + cfg.PESQ_BUTTON_COMPRAR + ' comprar" value="' + item.UNID_VENDA + '">Comprar <span id="icone' + item.ID_PROD + '" class="mdi mdi-' + cfg.CHECKOUT_ICON_CLASS_ADD + '"></span></Button>';
                            html += '</div>';
                        }
                        html += '</div>';
                    }
                }
            }
        }

        return html;
    }

    function GradeItens(data) {
        html = '<div class="row">';
        for (var i = 0; i < data[1][0].length; i++) {
            html += '<div class="col-6 mt-2 col-sm-3 px-1">';
            html += '<div class="destacaborda pesquisa-prod">';

            html += montaItem(data[0], data[1][0][i]);

            html += '</div>';
            html += '</div>';
            if ((i + 1) % 4 == 0) {
                html += '</div><div class="row">';
            }
        }
        html += '</div>';
        return html;
    }

    function MontaGradeItens(data) {
        $("#pesquisaProduto").html('');
        if (data[1].length == 0) {
            html = '<div class="alert alert-info">' +
                '<h4>Nenhum produto encontrado!</h4>' +
                '</div>';
        } else {
            html = GradeItens(data);
            if (data[1][0].length == data[0].REGISTROS_POR_CONSULTA) {
                html += '<hr id="hrMostrarMais">';
                html += '<div class="row" id="mostrarMais">';
                html += '<div class="col-xs-12 col-sm-6 offset-sm-3">';
                html += '<button class="mostrarMais btn btn-block btn' + data[0].PESQ_CLASS + '" id="1" >Ver Mais</a>';
                html += '</div>';
                html += '</div>';
            }
        }
        $("#pesquisaProduto").html(html);
        VerificaItensComprados();
        $body.removeClass("loading");
        CarregaImagensProdutos();
    }

    function IncrementaGradeItens(data) {
        $("#mostrarMais").remove();
        $("#hrMostrarMais").remove();
        if (data[1].length > 0) {
            html = GradeItens(data);
            if (data[1][0].length == data[0].REGISTROS_POR_CONSULTA) {
                html += '<hr id="hrMostrarMais">';
                html += '<div class="row" id="mostrarMais">';
                html += '<div class="col-xs-12 col-sm-6 offset-sm-3">';
                html += '<button class="mostrarMais btn btn-block btn' + data[0].PESQ_CLASS + '" id="' + data[0].PAGINA + '" >Ver Mais</a>';
                html += '</div>';
                html += '</div>';
            }
        }
        $("#pesquisaProduto").append(html);
        VerificaItensComprados();
        $body.removeClass("loading");
        CarregaImagensProdutos();
    }

    $(document).on('click', '.filtroFabricante', function() {
        var dados = $.get('/produtos/filtraFabricante/' + $(this).attr('name'));
        dados.done(function(data) {
            MontaGradeItens(data);
        });
    });

    $(document).on('click', '.filtroDescAdicional', function() {
        var dados = $.get('/produtos/filtroDescAdicional/' + $(this).attr('name'));
        dados.done(function(data) {
            MontaGradeItens(data);
        });
    });

    $(document).on('click', '.filtroAdicional', function() {
        var dados = $.get('/produtos/filtroAdicional/' + $(this).attr('name'));
        dados.done(function(data) {
            MontaGradeItens(data);
        });
    });

    $(document.body).on('click', '.mostrarMais', function() {
        var pagina = $(this).attr('id');
        pagina++;
        var dados = $.get('/produtos/mostrarmais/' + pagina);
        dados.done(function(data) {
            IncrementaGradeItens(data);
        });
    });

    $(document).on('click', '.alterarTamanho', function() {
        $("#ID_PROD").val($(this).val());
        $("#labelTamanho").html('Tamanho: ' + $(this).html());
    });


    $('.dropdown-menu a.dropdown-toggle').on('click', function(e) {
        if (!$(this).next().hasClass('show')) {
            $(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
        }
        var $subMenu = $(this).next(".dropdown-menu");
        $subMenu.toggleClass('show');

        $(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function(e) {
            $('.dropdown-submenu .show').removeClass("show");
        });

        return false;
    });

    function BuscaImagem(id, $img, $spinner) {
        if (id == ''){
            return;
        }
        var busca = $.get('/produtos/imagempesquisa/' + id);
        busca.done(function(data) {
            $spinner.remove();
            if (data != '') {
                $img.attr("src", data);
            } else {
                $img.attr("src", "/img/notfound.jpg");
            }
        });
        busca.fail(function(data) {
            $spinner.remove();
            $img.attr("src", "/img/notfound.jpg");
        });
    };

    function BuscaImagemCor(id, img, spinner) {
        if (id == ''){
            return;
        }

        var busca = $.get('/cor/imagem/' + id);
        busca.done(function(data) {
            spinner.remove();
            if (data != '') {
                img.attr("src", data);
            } else {
                img.attr("src", "/img/notfound.jpg");
            }
        });
        busca.fail(function(data) {
            spinner.remove();
            img.attr("src", "/img/notfound.jpg");
        });
    };

    function CarregaImagensProdutos() {
        var LoadImagens = $(".LoadImage");

        $(LoadImagens).each(function(pos, registro) {
            var $img = $(registro).find('img');
            var id = $img.attr('id');
            var $spinner = $(registro).find(".spinner");
            if (id != '') {
                BuscaImagem(id, $img, $spinner);
            }
        });
    };

    CarregaImagensProdutos();

    function CarregaImagemCores() {
        var LoadCor = $(".LoadCor");
        $(LoadCor).each(function(pos, registro) {
            var img = $(registro).find('img');
            var id = img.attr('id').substring(3);
            var spinner = $(registro).find(".spinner-grow");
            if (id != '') {
                BuscaImagemCor(id, img, spinner);
            }
        });
    }
    CarregaImagemCores();

    function BuscaImagemSelo(id, img) {
        if (id == ''){
            return;
        }

        var busca = $.get('/produtos/imagemselo/' + id);
        busca.done(function(data) {
            if (data != "") {
                img.attr("src", data);
            } else {
                img.attr("src", "/img/notfound.jpg");
            }
        });
        busca.fail(function(data) {
            img.attr("src", "/img/notfound.jpg");
        });
    };

    function CarregaImagemSelos() {
        var LoadSelo = $(".LoadSelo");
        $(LoadSelo).each(function(pos, registro) {
            var img = $(registro).find('img');
            var id = img.attr('id').substring(3);
            if (id != null) {
                BuscaImagemSelo(id, img);
            }
        });
    }

    CarregaImagemSelos();

    function BuscaImagemNormal(id, $img, $spinner) {
        var busca = $.get('/produtos/imagemnormal/' + id);
        busca.done(function(data) {
            if (data != "") {
                $img.attr("src", data);
            } else {
                $img.attr("src", "/img/notfound.jpg");
            }
        });
        busca.fail(function(data) {
            $img.attr("src", "/img/notfound.jpg");
        });
    };

    function CarregaImagensNormalProdutos() {
        var LoadImagens = $(".LoadImageNormal");

        $(LoadImagens).each(function(pos, registro) {
            var $img = $(registro).find('img');
            var id = $img.attr('id');
            if (id != '') {
                BuscaImagemNormal(id, $img);
            }
        });
    };

    CarregaImagensNormalProdutos();

    $(document).on('click', '.imagegaleriaclick', function() {
        var $img = $("#previewGaleria").find('img');
        var id = $(this).find('img').attr('id');
        BuscaImagemNormal(id, $img);
    });

    $(document).on('click', '.imagePreviewClick', function() {
        $('#galeriaModal').modal('show');
        $('.galeriaModal').slick('slickGoTo', 0);
    });


    $(document).on('click', '.listadesejos', function() {
        let sit = $(this).text();
        let obj = $(this);
        if (sit === 'heart-outline') {
            var add = $.get('/listadesejos/add/' + obj.val());
            add.done(function(data) {
                obj.html('<i class="mdi mdi-heart"></i>');
            });
        } else {
            var del = $.get('/listadesejos/deljq/' + obj.val());
            del.done(function(data) {
                obj.html('<i class="mdi mdi-heart-outline"></i>');
            });
        }
    });

    $('.alteraQuantidade').on('change', function() {
        $(this).removeClass('is-invalid');
    });

    $(document).on('submit', '.excluirItemCesta', function(e) {
        id = $(this).attr('id');
        $.get('/cesta/excluirdados/' + id)
            .done(function(data) {
                if ($("#analytics_OK").length == 1){
                    gtag('event', 'remove_from_cart', {
                        "items": [{
                            id: data['ID_PROD'],
                            name: data['DESCRICAO'],
                            list_name: "Pesquisa",
                            brand: data['FABRICANTE'],
                            category: data['SETOR'],
                            variant: "",
                            list_position: 1,
                            quantity: data['QUANTIDADE'],
                            price: data['UNITARIO'],
                        }]
                    });
                }
            });
    });

    $(document.body).on('click', '.enviarcesta, .itemenviarcesta', function() {
        var nome = $(this).attr('id').substring(2);
        var obj = $("#" + nome);

        var qtde = parseInt(obj.val());
        var estoque = parseInt($("#altqtd" + nome).attr('max'));
        var lancar = true;
        if ($("#altqtd" + nome).length >= 1) {
            if (qtde > estoque) {
                $("#altqtd" + nome).addClass('is-invalid');
                lancar = false;
            }
        }
        if (lancar) {
            var sit1 = obj.hasClass('comprar');
            var sit2 = obj.hasClass('itemcomprar');
            var adicionar = $.post('/cesta/adicionar', { id: nome, qtde: obj.val() });
            adicionar.done(function(data) {
                if ($("#analytics_OK").length == 1){
                    gtag('event', 'add_to_cart', {
                        "items": [{
                            id: data['ID_PROD'],
                            name: data['DESCRICAO'],
                            list_name: "Pesquisa",
                            brand: data['FABRICANTE'],
                            category: data['SETOR'],
                            variant: "",
                            list_position: 1,
                            quantity: data['QUANTIDADE'],
                            price: data['UNITARIO'],
                        }]
                    });
                }
                if (sit1 || sit2) {
                    obj.removeClass('btn' + data.BUTTON_CLASS + data.PESQ_BUTTON_COMPRAR).addClass('btn' + data.BUTTON_CLASS + data.PESQ_BUTTON_ADICIONADO);
                    if (data.EXIB_COMBO_QTDE == 1) {
                        $("#grpComprar" + obj.attr("id")).removeClass('btn' + data.BUTTON_CLASS + data.PESQ_BUTTON_COMPRAR).addClass('btn' + data.BUTTON_CLASS + data.PESQ_BUTTON_ADICIONADO);
                        $("#" + obj.attr("id")).removeClass('comprar').addClass('adicionado').html('Adicionado <span class="mdi mdi-' + data.CHECKOUT_ICON_CLASS + '"></span>');
                        $("#" + obj.attr("id")).removeClass('btn' + data.BUTTON_CLASS + data.PESQ_BUTTON_COMPRAR).addClass('btn' + data.BUTTON_CLASS + data.PESQ_BUTTON_ADICIONADO);
                        obj.removeClass('itemcomprar').addClass('adicionado');
                    } else {
                        obj.removeClass('comprar').addClass('adicionado').html('Adicionado <span class="mdi mdi-' + data.CHECKOUT_ICON_CLASS + '"></span>');
                    }
                }
                if (data.ITENS > 0) {
                    $("#totalitens").text(data.ITENS);
                } else {
                    $("#totalitens").text('');
                }
                if (data.REDIREC_COMPRA == 1) {
                    $(location).attr('href', '/cesta/resumo');
                } else {
                    if ($("#cesta" + data.ITEM.ID_PROD).length >= 1) {
                        var html = '<div class="col-2">' +
                            '<img class="card-img-top"  src="/img/lojas/' + data.LOJA + '/produtos/mini/' + data.ITEM.ID_IMG + '.jpg">' +
                            '</div>' +
                            '<div class="col-6">' +
                            '<label class="col-form-label"><span style="text-transform: capitalize">' + data.ITEM.DESCRICAO + '</span></label>' +
                            '</div>' +
                            '<div class="col-2 text-right">' +
                            '<label class="col-form-label">' + data.ITEM.QUANTIDADE + '</label>' +
                            '</div>' +
                            '<div class="col-2 text-right">' +
                            '<label class="col-form-label">' + data.item.UNITARIO + '</label>' +
                            '</div>' +
                            '<hr>'
                        $("#cesta" + data.ITEM.ID_PROD).html(html);
                    } else {
                        var html = '<div id="cesta' + data.ITEM.ID_PROD + '" class="row">' +
                            '<div class="col-2">' +
                            '<img class="card-img-top"  src="/img/lojas/' + data.LOJA + '/produtos/mini/' + data.ITEM.ID_IMG + '.jpg">' +
                            '</div>' +
                            '<div class="col-6">' +
                            '<label class="col-form-label"><span style="text-transform: capitalize">' + data.ITEM.DESCRICAO + '</span></label>' +
                            '</div>' +
                            '<div class="col-2 text-right">' +
                            '<label class="col-form-label">' + data.ITEM.QUANTIDADE + '</label>' +
                            '</div>' +
                            '<div class="col-2 text-right">' +
                            '<label class="col-form-label">' + data.ITEM.UNITARIO + '</label>' +
                            '</div>' +
                            '</div>' +
                            '<hr>';
                        $("#modalItens").append(html);
                    }
                    $("#cestaTotal").html('<strong>Total R$ ' + data.TOTAL + '</strong>');
                    $("#modalContinuarComprando").modal("show");
                }
            });
        }
    });

    $(document.body).on('click', '.confirmQtdeCard, .confirmQtdFrac', function() {
        var lancar = true;
        // aqui se for de menu suspenso
        if ($(this).hasClass('confirmQtdFrac')){
            var obj = $("#qtdfrac"+$(this).val());
            var ID_PROD = $(this).val();
            var qtd = parseInt(obj.val());
            var estoque = parseInt(obj.attr("max"));
            var sit1 = obj.hasClass('comprar');
            var sit2 = obj.hasClass('itemcomprar');


        } else { // aqui se for de modal para quantidade
            var obj = $("#" + $("#idQtdeCard").val());
            var ID_PROD = obj.attr("id");
            var qtd = parseInt($("#qtdeCard").val());
            var estoque = parseInt($("#altqtd" + $("#idQtdeCard").val()).attr("max"));
            var sit1 = obj.hasClass('comprar');
            var sit2 = obj.hasClass('itemcomprar');
            $("#digQtdeCard").modal("hide");

            if ($("#altqtd" + obj.attr("id")).length >= 1) {
                if (qtd > estoque) {
                    $("#altqtd" + obj.attr("id")).addClass('is-invalid');
                    lancar = false;
                }
            }
        }

        if (lancar) {
            var adicionar = $.post('/cesta/adicionar', { id: ID_PROD, qtde: qtd });
            adicionar.done(function(data) {
                if ($("#analytics_OK").length == 1){
                    gtag('event', 'add_to_cart', {
                        "items": [{
                            id: data['ID_PROD'],
                            name: data['DESCRICAO'],
                            list_name: "Pesquisa",
                            brand: data['FABRICANTE'],
                            category: data['SETOR'],
                            variant: "",
                            list_position: 1,
                            quantity: data['QUANTIDADE'],
                            price: data['UNITARIO'],
                        }]
                    });
                }
                if (sit1 || sit2) {
                    obj.removeClass('btn' + data.BUTTON_CLASS + data.PESQ_BUTTON_COMPRAR).addClass('btn' + data.BUTTON_CLASS + data.PESQ_BUTTON_ADICIONADO);
                    if (data.EXIB_COMBO_QTDE == 1) {
                        $("#grpComprar" + ID_PROD).removeClass('btn' + data.BUTTON_CLASS + data.PESQ_BUTTON_COMPRAR).addClass('btn' + data.BUTTON_CLASS + data.PESQ_BUTTON_ADICIONADO);
                        $("#" + ID_PROD).removeClass('comprar').addClass('adicionado').html('Adicionado  <span class="mdi mdi-' + data.CHECKOUT_ICON_CLASS + '"></span>');
                        $("#" + ID_PROD).removeClass('btn' + data.BUTTON_CLASS + data.PESQ_BUTTON_COMPRAR).addClass('btn' + data.BUTTON_CLASS + data.PESQ_BUTTON_ADICIONADO);
                        obj.removeClass('itemcomprar').addClass('adicionado');
                    } else {
                        obj.removeClass('comprar').addClass('adicionado').html('Adicionado <span class="mdi mdi-' + data.CHECKOUT_ICON_CLASS + '"></span>');
                    }
                }
                if (data.ITENS > 0) {
                    $("#totalitens").text(data.ITENS);
                } else {
                    $("#totalitens").text('');
                }
                if (data.REDIREC_COMPRA == 1) {
                    $(location).attr('href', '/cesta/resumo');
                } else {
                    if ($("#cesta" + data.ITEM.ID_PROD).length >= 1) {
                        var html = '<div class="col-2">' +
                            '<img class="card-img-top"  src="/img/lojas/' + data.LOJA + '/produtos/mini/' + data.ITEM.ID_IMG + '.jpg">' +
                            '</div>' +
                            '<div class="col-6">' +
                            '<label class="col-form-label"><span style="text-transform: capitalize">' + data.ITEM.DESCRICAO + '</span></label>' +
                            '</div>' +
                            '<div class="col-2 text-right">' +
                            '<label class="col-form-label">' + data.ITEM.QUANTIDADE + '</label>' +
                            '</div>' +
                            '<div class="col-2 text-right">' +
                            '<label class="col-form-label">' + data.item.UNITARIO + '</label>' +
                            '</div>' +
                            '<hr>'
                        $("#cesta" + data.ITEM.ID_PROD).html(html);
                    } else {
                        var html = '<div id="cesta' + data.ITEM.ID_PROD + '" class="row">' +
                            '<div class="col-2">' +
                            '<img class="card-img-top"  src="/img/lojas/' + data.LOJA + '/produtos/mini/' + data.ITEM.ID_IMG + '.jpg">' +
                            '</div>' +
                            '<div class="col-6">' +
                            '<label class="col-form-label"><span style="text-transform: capitalize">' + data.ITEM.DESCRICAO + '</span></label>' +
                            '</div>' +
                            '<div class="col-2 text-right">' +
                            '<label class="col-form-label">' + data.ITEM.QUANTIDADE + '</label>' +
                            '</div>' +
                            '<div class="col-2 text-right">' +
                            '<label class="col-form-label">' + data.ITEM.UNITARIO + '</label>' +
                            '</div>' +
                            '</div>' +
                            '<hr>';
                        $("#modalItens").append(html);
                    }
                    $("#cestaTotal").html('<strong>Total R$ ' + data.TOTAL + '</strong>');
                    $("#modalContinuarComprando").modal("show");
                }
            });
        }
    });

    $(document.body).on('click', '.comprar, .itemcomprar', function() {
        var obj = $(this);
        if ($("#configQtdeCard").val() == 1) {
            $("#idQtdeCard").val(obj.attr("id"));
            $("#qtdeCard").val('1');
            $("#digQtdeCard").modal("show");
        } else {
            var qtde = parseInt(obj.val());
            var estoque = parseInt($("#altqtd" + obj.attr("id")).attr("max"));
            var sit1 = obj.hasClass('comprar');
            var sit2 = obj.hasClass('itemcomprar');
            var lancar = true;
            if ($("#altqtd" + obj.attr("id")).length >= 1) {
                if (qtde > estoque) {
                    $("#altqtd" + obj.attr("id")).addClass('is-invalid');
                    lancar = false;
                }
            }
            if (lancar) {
                var adicionar = $.post('/cesta/adicionar', { id: obj.attr("id"), qtde: obj.val() });
                adicionar.done(function(data) {
                    if ($("#analytics_OK").length == 1){
                        gtag('event', 'add_to_cart', {
                            "items": [{
                                id: data['ID_PROD'],
                                name: data['DESCRICAO'],
                                list_name: "Pesquisa",
                                brand: data['FABRICANTE'],
                                category: data['SETOR'],
                                variant: "",
                                list_position: 1,
                                quantity: data['QUANTIDADE'],
                                price: data['UNITARIO'],
                            }]
                        });
                    }
                    if (sit1 || sit2) {
                        obj.removeClass('btn' + data.BUTTON_CLASS + data.PESQ_BUTTON_COMPRAR).addClass('btn' + data.BUTTON_CLASS + data.PESQ_BUTTON_ADICIONADO);
                        if (data.EXIB_COMBO_QTDE == 1) {
                            $("#grpComprar" + obj.attr("id")).removeClass('btn' + data.BUTTON_CLASS + data.PESQ_BUTTON_COMPRAR).addClass('btn' + data.BUTTON_CLASS + data.PESQ_BUTTON_ADICIONADO);
                            $("#" + obj.attr("id")).removeClass('comprar').addClass('adicionado').html('Adicionado <span class="mdi mdi-' + data.CHECKOUT_ICON_CLASS + '"></span>');
                            $("#" + obj.attr("id")).removeClass('btn' + data.BUTTON_CLASS + data.PESQ_BUTTON_COMPRAR).addClass('btn' + data.BUTTON_CLASS + data.PESQ_BUTTON_ADICIONADO);
                            obj.removeClass('itemcomprar').addClass('adicionado');
                        } else {
                            obj.removeClass('comprar').addClass('adicionado').html('Adicionado <span class="mdi mdi-' + data.CHECKOUT_ICON_CLASS + '"></span>');
                        }
                    }
                    if (data.ITENS > 0) {
                        $("#totalitens").text(data.ITENS);
                    } else {
                        $("#totalitens").text('');
                    }

                    if (data.CATALOGO == 1) {
                        //  Catalogo Ativo

                    } else {
                        if (data.REDIREC_COMPRA == 1) {
                            $(location).attr('href', '/cesta/resumo');
                        } else {
                            $("#cestaTotal").html('<strong>Total R$ ' + data.TOTAL + '</strong>');
                            if (data.REDIREC_COMPRA == 2) {
                                if ($("#cesta" + data.ITEM.ID_PROD).length >= 1) {
                                    var html = '<div class="col-2">';
                                        if (data.PESQ_TIPO_IMAGEM == 1) {
                                            html += '<img class="card-img-top"  src="/img/lojas/' + data.LOJA + '/produtos/mini/' + data.ITEM.ID_IMG + '.jpg">';
                                        } else {
                                            html += '<img class="card-img-top"  src="/img/lojas/' + data.LOJA + '/produtos/normal/' + data.ITEM.ID_IMG + '.jpg">';
                                        }
                                        html += '</div>' +
                                        '<div class="col-6">' +
                                        '<label class="col-form-label"><span style="text-transform: capitalize">' + data.ITEM.DESCRICAO + '</span></label>' +
                                        '</div>' +
                                        '<div class="col-2 text-right">' +
                                        '<label class="col-form-label">' + data.ITEM.QUANTIDADE + '</label>' +
                                        '</div>' +
                                        '<div class="col-2 text-right">' +
                                        '<label class="col-form-label">' + data.item.UNITARIO + '</label>' +
                                        '</div>' +
                                        '<hr>'
                                    $("#cesta" + data.ITEM.ID_PROD).html(html);
                                } else {
                                    var html = '<div id="cesta' + data.ITEM.ID_PROD + '" class="row">' +
                                        '<div class="col-2">';
                                        if (data.PESQ_TIPO_IMAGEM == 1) {
                                            html +='<img class="card-img-top"  src="/img/lojas/' + data.LOJA + '/produtos/mini/' + data.ITEM.ID_IMG + '.jpg">';
                                        } else {
                                            html +='<img class="card-img-top"  src="/img/lojas/' + data.LOJA + '/produtos/normal/' + data.ITEM.ID_IMG + '.jpg">';
                                        }
                                        html += '</div>'+
                                        '<div class="col-6">' +
                                        '<label class="col-form-label"><span style="text-transform: capitalize">' + data.ITEM.DESCRICAO + '</span></label>' +
                                        '</div>' +
                                        '<div class="col-2 text-right">' +
                                        '<label class="col-form-label">' + data.ITEM.QUANTIDADE + '</label>' +
                                        '</div>' +
                                        '<div class="col-2 text-right">' +
                                        '<label class="col-form-label">' + data.ITEM.UNITARIO + '</label>' +
                                        '</div>' +
                                        '</div>' +
                                        '<hr>';
                                    $("#modalItens").append(html);
                                }
                                $("#modalContinuarComprando").modal("show");
                            }
                        }
                    }
                });
            }
        }
    });

    function VerificaItensComprados() {
        if ($('#btComprarHabilitado').val() == 1) {
            var classes = $.get('/cesta/classebotoes');
            var classeCompra = '-success';
            var classeAdicionado = '-primary'
            classes.done(function(datac) {

                classeCompra = "btn" + datac.BUTTON_CLASS + datac.PESQ_BUTTON_COMPRAR;
                classeAdicionado = "btn" + datac.BUTTON_CLASS + datac.PESQ_BUTTON_ADICIONADO;
                classeIcone = datac.CHECKOUT_ICON_CLASS;

                var cesta = $.get('/cesta/itens');
                cesta.done(function(data) {
                    for (var i = 0; i < data.length; i++) {
                        $("#" + data[i] + ".comprar").removeClass('comprar').addClass('adicionado').html('Adicionado <span class="mdi mdi-' + classeIcone + '"></span>');
                        $("#" + data[i] + ".adicionado").removeClass(classeCompra).addClass(classeAdicionado);
                        if (datac.EXIB_COMBO_QTDE == 1) {
                            $("#grpComprar" + data[i] + ".grpComprar").removeClass(classeCompra).addClass(classeAdicionado);
                            $("#" + data[i] + ".itemcomprar").removeClass('itemcomprar').addClass('adicionado');
                        }
                    }
                });
            });
        }
    }

    $("#cep").keydown(function(event) {
        $('#cep').popover('hide');
        var arrNumeros = ["Enter", "Backspace", "Tab", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
        if ($.inArray(event.key, arrNumeros) === -1) {
            event.preventDefault();
        } else {
            if ($('#cep').val().length == 9 && $.inArray(event.key, ["Enter", "Backspace"]) === -1) {
                event.preventDefault();
            }
        }
    });

    $("#cep").keyup(function(event) {
        if (event.which != 8) {
            if ($('#cep').val().length == 5) {
                $('#cep').val($('#cep').val() + "-");
            }
        }
    });

    $(document).on('submit', '#definirCep', function() {
        if ($("#cep").val().length == 9) {
            return;
        }
        $('#cep').popover('show');
        event.preventDefault();
    });

    $(document).on('click', '.opcaofrete', function() {
        var frete = $(this).find('.frete-selecionado').val();
        var id_frete = $(this).find('.frete-selecionado').attr('id');
        var descricao = $(this).find('.frete-descricao').val();

        $.post('/cesta/definefrete', { id: id_frete, valor: frete})
            .done(function(data) {
                if ($("#analytics_OK").length == 1){
                    gtag('event', 'set_checkout_option', {
                        "checkout_step": 1,
                        "checkout_option": "Opção de Entrega",
                        "value": descricao,
                    });
                }

                $("#subtotal").html("<strong>" + data.SUBTOTAL + "</strong>");
                $("#frete").text(data.FRETE);
                $("#valfrete").val(data.VALORFRETE);
                $("#total").html("<strong>" + data.TOTAL + "</strong>");

                if (data.SUBTOTAL == "0,00"){
                    $(".expirada").removeClass('d-none');
                    $('#valprodutos').val('0');
                    $("#valdesconto").val('0')
                }

                if ($("#CART_PARCELAS").length > 0) {
                    $("#CART_PARCELAS").html("");
                }
                if ($("#BOL_PARCELAS").length > 0) {
                    $("#BOL_PARCELAS").html("");
                }
            });
    });

    function atualizaFrete(ENTREGA) {
        var html = "";
        if (ENTREGA[0].length > 0){
            if (ENTREGA[0][0].ValorGratis == -999) {
                $("#faltaGratis").html('');
            } else {
                $("#faltaGratis").html('<strong class="text-danger"><span class="h4 mdi mdi-alert-decagram-outline"></span> Falta R$ ' + ENTREGA[0][0].ValorGratis + ' para frete gratis!</strong>');
            }
        }

        for (i = 0; i < ENTREGA[1].length; i++) {
            html += '<div class="row">' +
                '    <div class="col-sm-8">' +
                '        <div class="form-check">' +
                '            <input class="form-check-input opcaofrete" type="radio" name="frete" id="frt' + ENTREGA[1][i].ID + '" value="' + ENTREGA[1][i].VALOR + '"' + (i == 0 ? 'checked' : '') + '>' +
                '            <label class="form-check-label" for="frt' + ENTREGA[1][i].ID + '" >' + ENTREGA[1][i].DESCRICAO + '(' + ENTREGA[1][i].PRAZO + ')</label>' +
                '        </div>' +
                '    </div>' +
                '    <label class="col-sm-4 text-right" id="lbl' + ENTREGA[1][i].ID + '">' + ENTREGA[1][i].VALOR + '</label>' +
                '</div>';
        }
        $("#listaopcoesfrete").html(html);
    }

    function atualizaTotaisResumo(obj, data) {
        $("#qtd" + obj.val()).text(data.QTDE);
        $("#subtotal").html("<strong>" + data.SUBTOTAL + "</strong>");
        $("#frete").text(data.FRETE);
        $("#total").html("<strong>" + data.TOTAL + "</strong>")
        if (data.ITENS > 0) {
            $("#totalitens").text(data.ITENS);
        } else {
            $("#totalitens").text('');
        }

        if ($("#PROD_SEM_ESTOQUE").val() != 3) {
            if (data.ALTERADO >= $("#est" + obj.val()).val()) {
                $("#incQtd" + obj.val()).attr("disabled", true);
            } else {
                $("#incQtd" + obj.val()).attr("disabled", false);
            }
            if (data.ALTERADO <= $("#est" + obj.val()).val()) {
                $("#indisp" + obj.val()).remove();
            }
            if ($(".indisponivel").length == 0 && $(".bloqueado").length == 0) {
                $("#divConcluir").html('<a href="/cesta/concluir" class="btn btn-success btn-block mdi mdi-credit-card-check-outline"> CONCLUIR PEDIDO</a>');
            }
        }
        if (data.ALTERADO == 1) {
            $("#decQtd" + obj.val()).attr("disabled", true);
        } else {
            $("#decQtd" + obj.val()).attr("disabled", false);
        }
    }

    $(document.body).on('click', '.incQtde', function() {
        var obj = $(this);
        var metodo = $.post('/cesta/incrementa', { id: obj.val(), qtd: 1 });
        metodo.done(function(data) {
            if (data != "") {
                atualizaTotaisResumo(obj, data);
                atualizaFrete(data.ENTREGA);
            }
        });
    });

    $(document.body).on('click', '.decQtde', function() {
        var obj = $(this);
        if ($("#qtd" + obj.val()).text() != "1") {
            var metodo = $.post('/cesta/decrementa', { id: obj.val(), qtd: 1 });
            metodo.done(function(data) {
                if (data != "") {
                    atualizaTotaisResumo(obj, data);
                    atualizaFrete(data.ENTREGA);
                }
            });
        }
    });

    function CarregaDescricaoDetalhada() {
        if ($('#descricaodetalhada').length == 1) {
            var busca = $.get('/produtos/descricaodetalhada/' + $("#ID_PROD").val());
            busca.done(function(data) {
                $('#descricaodetalhada').html(data);
            });
            busca.fail(function(data) {
                $('#descricaodetalhada').html('');
            });
        }
    }

    function CarregaInformacaoComplementar() {
        if ($('#informacaocomplementar').length == 1) {
            var busca = $.get('/produtos/informacaocomplementar/' + $("#ID_PROD").val());
            busca.done(function(data) {
                $('#informacaocomplementar').html(data);
            });
            busca.fail(function(data) {
                $('#informacaocomplementar').html('');
            });
        }
    }

    function CarregaItensVitrine() {
        if ($("#sliderVitrine").length == 1) {
            var busca = $.get('/vitrine');
            busca.done(function(data) {
                html = "";
                for (var i = 0; i < data[1][0].length; i++) {
                    html += '<div class="destacabordaVitrine">';
                    html += montaItem(data[0], data[1][0][i]);
                    html += ' </div>';
                }
                $("#spinnerVitrine").remove();
                $("#sliderVitrine").html(html);

                $('.vitrine').slick({

                    prevArrow: '<button class="btn btn-slick slide-seta anterior-seta ts-seta-slick-ant"></button>',
                    nextArrow: '<button class="btn btn-slick slide-seta proximo-seta ts-seta-slick-pro"></button>',
                    dots: true,
                    infinite: true,
                    speed: 500,
                    slidesToShow: 5,
                    slidesToScroll: 2,
                    responsive: [
                        {
                            breakpoint: 991,
                            settings: {
                                infinite: true,
                                dots: true,
                                slidesToShow: 4,
                                slidesToScroll: 2,
                            }
                        },
                        {
                            breakpoint: 767,
                            settings: {
                                arrows: false,
                                slidesToShow: 2,
                                slidesToScroll: 2,
                            }
                        },
                        {
                            breakpoint: 575,
                            settings: {
                                arrows: false,
                                slidesToShow: 2,
                                slidesToScroll: 2
                            }
                        }
                    ]
                });
                $body.removeClass("loading");
                CarregaImagensProdutos();
                CarregaImagemSelos();
            });
            busca.fail(function data() {
                $("#spinnerVitrine").remove();
            });
        }
    }

    function CarregaItensMaisVendidos() {
        if ($("#sliderMaisVendidos").length == 1) {
            var busca = $.get('/maisVendidos');
            busca.done(function(data) {
                html = "";
                for (var i = 0; i < data[1][0].length; i++) {
                    html += '<div class="destacabordaVitrine">';
                    html += montaItem(data[0], data[1][0][i]);
                    html += ' </div>';
                }
                $("#spinnerMaisVendidos").remove();
                $("#sliderMaisVendidos").html(html);


                $('.maisvendidos').slick({

                    prevArrow: '<button class="btn btn-slick slide-seta anterior-seta ts-seta-slick-ant"></button>',
                    nextArrow: '<button class="btn btn-slick slide-seta proximo-seta ts-seta-slick-pro"></button>',
                    dots: true,
                    infinite: true,
                    speed: 500,
                    slidesToShow: 5,
                    slidesToScroll: 2,
                    responsive: [
                        {
                            breakpoint: 991,
                            settings: {
                                infinite: true,
                                dots: true,
                                slidesToShow: 4,
                                slidesToScroll: 2,
                            }
                        },
                        {
                            breakpoint: 767,
                            settings: {
                                arrows: false,
                                slidesToShow: 2,
                                slidesToScroll: 2,
                            }
                        },
                        {
                            breakpoint: 575,
                            settings: {
                                arrows: false,
                                slidesToShow: 2,
                                slidesToScroll: 2,
                            }
                        }
                    ]
                });
                $body.removeClass("loading");
                CarregaImagensProdutos();
                CarregaImagemSelos();
            });
            busca.fail(function data() {
                $("#spinnerMaisVendidos").remove();
            });
        }
    }

    function CarregaItensPatrocinados() {
        if ($("#sliderPatrocinados").length == 1) {
            var busca = $.get('/patrocinados');
            busca.done(function(data) {
                html = "";
                for (var i = 0; i < data[1][0].length; i++) {
                    html += '<div class="destacabordaVitrine">';
                    html += montaItem(data[0], data[1][0][i]);
                    html += ' </div>';
                }
                $("#spinnerPatrocinados").remove();
                $("#sliderPatrocinados").html(html);

                $('.patrocinados').slick({

                    prevArrow: '<button class="btn btn-slick slide-seta anterior-seta ts-seta-slick-ant"></button>',
                    nextArrow: '<button class="btn btn-slick slide-seta proximo-seta ts-seta-slick-pro"></button>',
                    dots: true,
                    infinite: true,
                    speed: 500,
                    slidesToShow: 5,
                    slidesToScroll: 2,
                    responsive: [
                        {
                            breakpoint: 991,
                            settings: {
                                infinite: true,
                                dots: true,
                                slidesToShow: 4,
                                slidesToScroll: 2,
                            }
                        },
                        {
                            breakpoint: 767,
                            settings: {
                                arrows: false,
                                slidesToShow: 2,
                                slidesToScroll: 2,
                            }
                        },
                        {
                            breakpoint: 575,
                            settings: {
                                arrows: false,
                                slidesToShow: 2,
                                slidesToScroll: 2
                            }
                        }
                    ]
                });

                $body.removeClass("loading");
                CarregaImagensProdutos();
                CarregaImagemSelos();
            });
            busca.fail(function data() {
                $("#spinnerPatrocinados").remove();
            });
        }
    }


    function CarregaItensMaisVendidosCategoria() {
        if ($("#sliderMaisVendidosCategoria").length == 1) {
            var busca = $.get('/produtos/maisvendidos/' + $("#ID_SET").val());
            busca.done(function(data) {
                if (data[1][0].length > 0) {
                    $("#produtosmaisvendidos").html(data[0].DET_MAIS);
                    html = "";
                    for (var i = 0; i < data[1][0].length; i++) {
                        html += '<div class="destacabordaVitrine">';
                        html += montaItem(data[0], data[1][0][i]);
                        html += ' </div>';
                    }
                    $("#spinnerMaisVendidos").remove();
                    $("#sliderMaisVendidosCategoria").html(html);

                    $('.maisvendidos').slick({

                        prevArrow: '<button class="btn btn-slick slide-seta anterior-seta ts-seta-slick-ant"></button>',
                        nextArrow: '<button class="btn btn-slick slide-seta proximo-seta ts-seta-slick-pro"></button>',
                        dots: true,
                        infinite: true,
                        speed: 500,
                        slidesToShow: 5,
                        slidesToScroll: 2,
                        responsive: [
                            {
                                breakpoint: 991,
                                settings: {
                                    infinite: true,
                                    dots: true,
                                    slidesToShow: 4,
                                    slidesToScroll: 2,
                                }
                            },
                            {
                                breakpoint: 767,
                                settings: {
                                    arrows: false,
                                    slidesToShow: 2,
                                    slidesToScroll: 2,
                                }
                            },
                            {
                                breakpoint: 575,
                                settings: {
                                    arrows: false,
                                    slidesToShow: 2,
                                    slidesToScroll: 2,
                                }
                            }
                        ]
                    });
                    $body.removeClass("loading");
                    CarregaImagensProdutos();
                    CarregaImagemSelos();
                } else {
                    $("#spinnerMaisVendidos").remove();
                    $("#sliderMaisVendidos").html('');
                }
            });
            busca.fail(function data() {
                $("#spinnerMaisVendidos").remove();
            });
        }
    }


    function CarregaItensPatrocinadosCategoria() {
        if ($("#sliderPatrocinadosCategoria").length == 1) {
            var busca = $.get('/produtos/patrocinados/' + $("#ID_SET").val());
            busca.done(function(data) {
                if (data[1][0].length > 0) {
                    $("#produtospatrocinados").html(data[0].DET_PATROC);
                    html = "";
                    for (var i = 0; i < data[1][0].length; i++) {
                        html += '<div class="destacabordaVitrine">';
                        html += montaItem(data[0], data[1][0][i]);
                        html += ' </div>';
                    }
                    $("#spinnerPatrocinados").remove();
                    $("#sliderPatrocinadosCategoria").html(html);

                    $('.patrocinados').slick({

                        prevArrow: '<button class="btn btn-slick slide-seta anterior-seta ts-seta-slick-ant"></button>',
                        nextArrow: '<button class="btn btn-slick slide-seta proximo-seta ts-seta-slick-pro"></button>',
                        dots: true,
                        infinite: true,
                        speed: 500,
                        slidesToShow: 5,
                        slidesToScroll: 2,
                        responsive: [
                            {
                                breakpoint: 991,
                                settings: {
                                    infinite: true,
                                    dots: true,
                                    slidesToShow: 4,
                                    slidesToScroll: 2,
                                }
                            },
                            {
                                breakpoint: 767,
                                settings: {
                                    arrows: false,
                                    slidesToShow: 2,
                                    slidesToScroll: 2,
                                }
                            },
                            {
                                breakpoint: 575,
                                settings: {
                                    arrows: false,
                                    slidesToShow: 2,
                                    slidesToScroll: 2,
                                }
                            }
                        ]
                    });
                    $body.removeClass("loading");
                    CarregaImagensProdutos();
                    CarregaImagemSelos();
                } else {
                    $("#spinnerPatrocinados").remove();
                    $("#sliderPatrocinados").html('');
                }
            });
            busca.fail(function data() {
                $("#spinnerPatrocinados").remove();
            });
        }
    }

    function ProdutosRelacionados() {
        if ($("#sliderRelacionados").length == 1) {
            var busca = $.get('/produtos/relacionados/' + $("#ID_PROD").val());
            busca.done(function(data) {
                if (data[1][0].length > 0) {
                    $("#produtosRelacionados").html(data[0].DET_RELAC);
                    html = "";
                    for (var i = 0; i < data[1][0].length; i++) {
                        html += '<div class="destacabordaVitrine">';
                        html += montaItem(data[0], data[1][0][i]);
                        html += ' </div>';
                    }
                    $("#sliderRelacionados").html(html);

                    $('.relacionados').slick({
                        prevArrow: '<button class="btn btn-slick slide-seta anterior-seta ts-seta-slick-ant"></button>',
                        nextArrow: '<button class="btn btn-slick slide-seta proximo-seta ts-seta-slick-pro"></button>',
                        dots: true,
                        infinite: true,
                        speed: 500,
                        slidesToShow: 5,
                        slidesToScroll: 2,
                        responsive: [
                            {
                                breakpoint: 991,
                                settings: {
                                    infinite: true,
                                    dots: true,
                                    slidesToShow: 4,
                                    slidesToScroll: 2,
                                }
                            },
                            {
                                breakpoint: 767,
                                settings: {
                                    arrows: false,
                                    slidesToShow: 2,
                                    slidesToScroll: 2,
                                }
                            },
                            {
                                breakpoint: 575,
                                settings: {
                                    arrows: false,
                                    slidesToShow: 2,
                                    slidesToScroll: 2,
                                }
                            }
                        ]
                    });
                    $body.removeClass("loading");
                    CarregaImagensProdutos();
                    CarregaImagemSelos();
                }
            });
        }
    }


    function ProdutosDestaques() {
        if ($("#sliderDestaques").length == 1) {
            var busca = $.get('/produtos/destaques/' + $("#ID_PROD").val());
            busca.done(function(data) {
                if (data[1][0].length > 0) {
                    $("#produtosDestaques").html(data[0].DET_DEST);
                    html = "";
                    for (var i = 0; i < data[1][0].length; i++) {
                        html += '<div class="destacabordaVitrine">';
                        html += montaItem(data[0], data[1][0][i]);
                        html += ' </div>';
                    }
                    $("#sliderDestaques").html(html);

                    $('.destaques').slick({
                        prevArrow: '<button class="btn btn-slick slide-seta anterior-seta ts-seta-slick-ant"></button>',
                        nextArrow: '<button class="btn btn-slick slide-seta proximo-seta ts-seta-slick-pro"></button>',
                        dots: true,
                        infinite: true,
                        speed: 500,
                        slidesToShow: 5,
                        slidesToScroll: 2,
                        responsive: [
                            {
                                breakpoint: 991,
                                settings: {
                                    infinite: true,
                                    dots: true,
                                    slidesToShow: 4,
                                    slidesToScroll: 2,
                                }
                            },
                            {
                                breakpoint: 767,
                                settings: {
                                    arrows: false,
                                    slidesToShow: 2,
                                    slidesToScroll: 2,
                                }
                            },
                            {
                                breakpoint: 575,
                                settings: {
                                    arrows: false,
                                    slidesToShow: 2,
                                    slidesToScroll: 2,
                                }
                            }
                        ]
                    });
                    $body.removeClass("loading");
                    CarregaImagensProdutos();
                    CarregaImagemSelos();
                }
            });
        }
    }

    function CorrigeRodape() {
        var heihgtRodape = $("#rodape").height();
        if (heihgtRodape > 390) {
            $("#conteudo").css("padding-bottom", heihgtRodape);
        }
    }

    $body = $("body");

    /* ----------- RELOAD NA TELA QUANDO APERTA O BOTAO VOLTAR DO NaVEGADOR */
    window.addEventListener( "pageshow", function ( event ) {
        var historyTraversal = event.persisted ||
        ( typeof window.performance != "undefined" &&
        window.performance.navigation.type === 2 );
        if ( historyTraversal ) {
            window.location.reload();
        }
    });
    /* ----------- FIM RELOAD NA TELA QUANDO APERTA O BOTAO VOLTAR DO NOVEGADOR */

    $(document).on('mouseenter', '.destacaborda', function() {
        if ($("#ocultarBtComprar").val() == 1) {
            $(this).children('.divbtComprar').removeClass('invisible');
        }
    });

    $(document).on('mouseleave', '.destacaborda', function() {
        if ($("#ocultarBtComprar").val() == 1) {
            $(this).children('.divbtComprar').addClass('invisible');
        }
    });

    $(document).on('change', '.alteraQuantidade', function() {
        var qtde = $(this).val();
        if ($("#ec" + $(this).attr('name')).length >= 1) {
            $("#ec" + $(this).attr('name')).val(qtde);
        }
        $("#" + $(this).attr('name')).val(qtde);
    });

    $(document).on('click', '.btnPrintCatalogo', function() {
        window.print();
    });

    // -------------- COTACAO EMAIL
    $(document).on("submit", ".cotacaoEmail", function(e) {
        e.preventDefault();

        var email = $(this).serializeArray();
        $.get("/emails/CotacaoEmail", { emailCotacao: email[2].value, textoCotacao: email[3].value })
            .done(function(data) {
                if (data == 1) {
                    // - SUCESSO AO ENVIAR
                    // $("#cont-email").val("");
                    // $("#emailDistribuidora").prop("checked", false);
                } else {
                    // FALHA NO RETORNO
                }
            })
            .fail(function() {
                //OCORREU UMA FALHA
            });

        return false;
    });
    // -------------- FIM COTACAO EMAIL

    $(window).on("load", function(){
        CorrigeRodape();
        ProdutosRelacionados();
        ProdutosDestaques();
        VerificaItensComprados();
        CarregaDescricaoDetalhada();
        CarregaInformacaoComplementar();
        CarregaItensVitrine()
        CarregaItensMaisVendidos()
        CarregaItensPatrocinados()
        CarregaItensMaisVendidosCategoria()
        CarregaItensPatrocinadosCategoria();
 
        $(document).on({
            ajaxStart: function() {
                $body.addClass("loading");
            },
            ajaxStop: function() {
                $body.removeClass("loading");
            }
        });
    });

});
