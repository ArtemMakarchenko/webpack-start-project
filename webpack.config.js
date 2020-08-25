const path = require('path') //Доступ к модулю работы с путями фалов
const HTMLWebpackPlugin = require('html-webpack-plugin') // Доступ к плагину HTMLWebpackPlugin
const { CleanWebpackPlugin } = require('clean-webpack-plugin') // Доступ к плагину CleanWebpackPlugi
const CopyWebpackPlugin = require('copy-webpack-plugin') // Доступ к плагину CopyWebpackPlugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // Доступ к плагину MiniCssExtractPlugin
const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin') // OptimizeCssAssetWebpackPlugin
const TerserWebpackPlugin = require('terser-webpack-plugin') // Доступ к плагину TerserWebpackPlugin
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer') // Доступ к плагину BundleAnalyzerPlugin

// Переменная для проверки режима запуска сборки
const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

//  Настройка оптимизации файлов
const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }
    if (isProd) {
        config.minimizer = [
            new OptimizeCssAssetWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    }
    return config
}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

//  Настройка плагинов для обработки CSS
const cssLoaders = extra => {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {
                hmr: isDev,
                reloadAll: true
            },
        },
        'css-loader'
    ]
    if (extra) {
        loaders.push(extra)
    }
    return loaders
}

//  Настройка Bable
const babelOptions = preset => {
    const opts = {
        presets: [
            '@babel/preset-env'
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties'
        ]
    }
    if (preset) {
        opts.presets.push(preset)
    }
    return opts
}

//  Поключение плагинов для обработки JS (Bable и esLint)
const jsLoaders = () => {
    const loaders = [{
        loader: 'babel-loader',
        options: babelOptions()
    }]
    if (isDev) {
        loaders.push('eslint-loader')
    }
    return loaders
}

// Плагины сборки
const plugins = () => {
    const base = [
        // Работа с HTML
        new HTMLWebpackPlugin({
            template: './index.html',
            minify: {
                collapseWhitespace: isProd
            }
        }),
        //  Чистит папку dist
        new CleanWebpackPlugin(),
        // Копирует в папку dist файлы которые не нуждаются в компеляции
        // new CopyWebpackPlugin({
        //     patterns: [
        //          Пример копирования файлов без обработки
        //         {
        //             from: path.resolve(__dirname, 'src/favicon.ico'),
        //             to: path.resolve(__dirname, 'dist')
        //         }
        //     ]
        // }),
        //  Минимизирует CSS
        new MiniCssExtractPlugin({
            filename: filename('css')
        })
    ]
    //  Плагин графического просмотра размера компонентов в приложении
    if (isProd) {
        base.push(new BundleAnalyzerPlugin())
    }

    return base
}

//  Главный блок содержащий все зависимости
module.exports = {
    context: path.resolve(__dirname, 'src'),  // Папка от которой начинается отсчёт директорий
    mode: 'development',  // Режим запуска сборки по умолчанию
    //  Точки входа
    entry: {
        main: ['@babel/polyfill', './js/index.js']
    },
    //  Папка выгрузки собраных файлов
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist')
    },
    //  Дефолтные форматы файлов
    resolve: {
        extensions: ['.js', '.json'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        }
    },
    //  Минимизация файлов
    optimization: optimization(),
    devServer: {
        port: 3000,
        hot: isDev
    },
    //  Добавляет в сборку минимизированные файлы
    devtool: isDev ? 'source-map' : '',
    //  Подключет плагины
    plugins: plugins(),
    //  Описывает работу загрузчиков
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: isDev,
                            reloadAll: true
                        },
                    }, 'css-loader'
                ]
            },
            {
                test: /\.less$/,
                use: cssLoaders('less-loader')
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoaders('sass-loader')
            },
            {
                test: /\.(png|jpg|svg|gif)$/,
                use: ['file-loader']
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                use: ['file-loader']
            },
            {
                test: /\.xml$/,
                use: ['xml-loader']
            },
            {
                test: /\.csv$/,
                use: ['csv-loader']
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: jsLoaders()
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: babelOptions('@babel/preset-typescript')
                }
            },
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: babelOptions('@babel/preset-react')
                }
            }
        ]
    }
}